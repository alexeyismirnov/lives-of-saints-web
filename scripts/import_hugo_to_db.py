#!/usr/bin/env python3
"""
Import Hugo content/ into PostgreSQL (SaintEntry, Section, SitePage).

Usage:
  npm run content:fetch   # clone Hugo repo with submodules first
  npm run import:content  # preferred (TypeScript)

Requires: psycopg2-binary, tomli (py3.10) or tomllib (py3.11+)
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Install: pip install psycopg2-binary tomli", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONTENT_DIR = ROOT / ".content-source" / "lives-of-saints-hugo" / "content"
CONTENT_DIR = Path(os.environ.get("CONTENT_DIR", DEFAULT_CONTENT_DIR))
DATABASE_URL = os.environ.get("DATABASE_URL")

MONTH_DIRS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
SECTION_CONFIG = [
    ("january", 1), ("february", 2), ("march", 3), ("april", 4),
    ("may", 5), ("june", 6), ("july", 7), ("august", 8),
    ("september", 9), ("october", 10), ("november", 11), ("december", 12),
    ("triodion", 13),
]

INCLUDE_RE = re.compile(
    r'\{\{%\s*include\s+file="content/(en|ru)/lives/([^"]+)"\s*%\}\}',
    re.IGNORECASE,
)
AUDIO_RE = re.compile(r'\{\{<\s*audio\s+"([^"]+)"\s*>\}\}', re.IGNORECASE)

RU_MONTHS = {
    "January": "января", "February": "февраля", "March": "марта",
    "April": "апреля", "May": "мая", "June": "июня",
    "July": "июля", "August": "августа", "September": "сентября",
    "October": "октября", "November": "ноября", "December": "декабря",
}


def parse_front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("+++"):
        return {}, text
    end = text.find("+++", 3)
    if end == -1:
        return {}, text
    fm_raw = text[3:end].strip()
    body = text[end + 3 :].lstrip("\n")
    data = tomllib.loads(fm_raw.encode() if isinstance(fm_raw, str) else fm_raw)
    return data, body


def slug_from_dir(name: str) -> str:
    return name.lower() if name != "triodion" else "triodion"


def read_body(lang: str, body: str, repo_root: Path) -> tuple[str, str | None]:
    audio_url = None
    for m in AUDIO_RE.finditer(body):
        audio_url = m.group(1)
    body = AUDIO_RE.sub("", body).strip()

    include = INCLUDE_RE.search(body)
    if include:
        inc_lang, inc_file = include.group(1), include.group(2)
        lives_path = repo_root / "content" / inc_lang / "lives" / inc_file
        if lives_path.exists():
            body = lives_path.read_text(encoding="utf-8").strip()
        else:
            print(f"  WARN missing lives file: {lives_path}")
    return body, audio_url


def parse_day(description: str, sort_weight: int) -> int | None:
    if not description:
        return sort_weight or None
    parts = description.strip().split()
    if parts and parts[0].isdigit():
        return int(parts[0])
    return sort_weight or None


def ensure_sections(cur) -> dict[str, str]:
    """Return slug -> section id (cuid from DB)."""
    cur.execute("SELECT id, slug FROM sections")
    existing = {row[1]: row[0] for row in cur.fetchall()}
    slug_to_id = dict(existing)

    for slug, sort_order in SECTION_CONFIG:
        if slug in slug_to_id:
            continue
        title = slug.capitalize() if slug != "triodion" else "Triodion"
        ru_titles = {
            "january": "Январь", "february": "Февраль", "march": "Март",
            "april": "Апрель", "may": "Май", "june": "Июнь",
            "july": "Июль", "august": "Август", "september": "Сентябрь",
            "october": "Октябрь", "november": "Ноябрь", "december": "Декабрь",
            "triodion": "Триодион",
        }
        cur.execute(
            """
            INSERT INTO sections (id, slug, "sortOrder", "titleEn", "titleRu")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s)
            RETURNING id
            """,
            (slug, sort_order, title, ru_titles.get(slug, title)),
        )
        slug_to_id[slug] = cur.fetchone()[0]

    # Update titles from Hugo _index if present
    for lang in ("en", "ru"):
        for month_dir in MONTH_DIRS + ["triodion"]:
            idx = CONTENT_DIR / lang / month_dir / "_index.md"
            if not idx.exists():
                continue
            fm, _ = parse_front_matter(idx.read_text(encoding="utf-8"))
            title = fm.get("title", "")
            if not title:
                continue
            slug = slug_from_dir(month_dir)
            col = '"titleEn"' if lang == "en" else '"titleRu"'
            cur.execute(
                f'UPDATE sections SET {col} = %s WHERE slug = %s',
                (title, slug),
            )
    return slug_to_id


def import_lang(cur, lang: str, slug_to_id: dict[str, str], stats: dict) -> None:
    lang_dir = CONTENT_DIR / lang
    if not lang_dir.exists():
        print(f"Missing {lang_dir}")
        return

    # Home page
    home = lang_dir / "_index.md"
    if home.exists():
        fm, body = parse_front_matter(home.read_text(encoding="utf-8"))
        body_md = body.strip() or fm.get("title", "")
        cur.execute(
            """
            INSERT INTO site_pages (id, language, "bodyMd")
            VALUES (gen_random_uuid()::text, %s::"Language", %s)
            ON CONFLICT (language) DO UPDATE SET "bodyMd" = EXCLUDED."bodyMd"
            """,
            (lang, body_md),
        )

    sections_to_scan = [(m, slug_from_dir(m)) for m in MONTH_DIRS]
    sections_to_scan.append(("triodion", "triodion"))

    for dir_name, section_slug in sections_to_scan:
        section_path = lang_dir / dir_name
        if not section_path.is_dir():
            continue
        section_id = slug_to_id[section_slug]
        is_triodion = section_slug == "triodion"
        count = 0

        for md_file in sorted(section_path.glob("*.md")):
            if md_file.name == "_index.md":
                continue
            fm, body = parse_front_matter(md_file.read_text(encoding="utf-8"))
            body_md, audio_url = read_body(lang, body, CONTENT_DIR.parent)

            link_title = fm.get("linkTitle") or fm.get("title") or md_file.stem
            description = fm.get("description", "")
            sort_weight = int(fm.get("weight", 0))
            day = None if is_triodion else parse_day(description, sort_weight)
            is_draft = bool(fm.get("draft", False))
            slug = md_file.stem

            cur.execute(
                """
                INSERT INTO saint_entries (
                    id, language, "sectionId", slug, "linkTitle", "calendarLabel",
                    "dayOfMonth", "sortWeight", "bodyMd", "audioUrl", "isDraft",
                    "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid()::text, %s::"Language", %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, NOW(), NOW()
                )
                ON CONFLICT (language, "sectionId", slug)
                DO UPDATE SET
                    "linkTitle" = EXCLUDED."linkTitle",
                    "calendarLabel" = EXCLUDED."calendarLabel",
                    "dayOfMonth" = EXCLUDED."dayOfMonth",
                    "sortWeight" = EXCLUDED."sortWeight",
                    "bodyMd" = EXCLUDED."bodyMd",
                    "audioUrl" = EXCLUDED."audioUrl",
                    "isDraft" = EXCLUDED."isDraft",
                    "updatedAt" = NOW()
                """,
                (
                    lang, section_id, slug, link_title, description,
                    day, sort_weight, body_md, audio_url, is_draft,
                ),
            )
            count += 1

        stats[f"{lang}/{section_slug}"] = count
        print(f"  {lang}/{section_slug}: {count} entries")


def main() -> None:
    if not DATABASE_URL:
        print("Set DATABASE_URL", file=sys.stderr)
        sys.exit(1)
    if not CONTENT_DIR.exists():
        print(f"CONTENT_DIR not found: {CONTENT_DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"Importing from {CONTENT_DIR}")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        slug_to_id = ensure_sections(cur)
        stats: dict[str, int] = {}
        for lang in ("en", "ru"):
            print(f"\nLanguage: {lang}")
            import_lang(cur, lang, slug_to_id, stats)
        conn.commit()
        print("\n=== Import complete ===")
        total = sum(stats.values())
        print(f"Total entries upserted: {total}")
    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()

/**
 * Import Hugo content/ into PostgreSQL via Prisma.
 * Run `npm run content:fetch` first to clone lives-of-saints-hugo with submodules.
 */
import { PrismaClient, Language } from "@prisma/client";
import fs from "fs";
import path from "path";
import { DEFAULT_CONTENT_DIR, resolveContentDir } from "./lib/content-source";

const prisma = new PrismaClient();
const CONTENT_DIR = resolveContentDir();

const MONTH_DIRS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SECTION_CONFIG: { slug: string; sortOrder: number; titleEn: string; titleRu: string }[] = [
  { slug: "january", sortOrder: 1, titleEn: "January", titleRu: "Январь" },
  { slug: "february", sortOrder: 2, titleEn: "February", titleRu: "Февраль" },
  { slug: "march", sortOrder: 3, titleEn: "March", titleRu: "Март" },
  { slug: "april", sortOrder: 4, titleEn: "April", titleRu: "Апрель" },
  { slug: "may", sortOrder: 5, titleEn: "May", titleRu: "Май" },
  { slug: "june", sortOrder: 6, titleEn: "June", titleRu: "Июнь" },
  { slug: "july", sortOrder: 7, titleEn: "July", titleRu: "Июль" },
  { slug: "august", sortOrder: 8, titleEn: "August", titleRu: "Август" },
  { slug: "september", sortOrder: 9, titleEn: "September", titleRu: "Сентябрь" },
  { slug: "october", sortOrder: 10, titleEn: "October", titleRu: "Октябрь" },
  { slug: "november", sortOrder: 11, titleEn: "November", titleRu: "Ноябрь" },
  { slug: "december", sortOrder: 12, titleEn: "December", titleRu: "Декабрь" },
  { slug: "triodion", sortOrder: 13, titleEn: "Triodion", titleRu: "Триодион" },
];

const INCLUDE_RE =
  /\{\{%\s*include\s+file="content\/(en|ru)\/lives\/([^"]+)"\s*%\}\}/i;
const AUDIO_RE = /\{\{<\s*audio\s+"([^"]+)"\s*>\}\}/gi;

function parseFrontMatter(text: string): { data: Record<string, unknown>; body: string } {
  if (!text.startsWith("+++")) return { data: {}, body: text };
  const end = text.indexOf("+++", 3);
  if (end === -1) return { data: {}, body: text };
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 3).replace(/^\n/, "");
  const data: Record<string, unknown> = {};
  for (const line of fmRaw.split("\n")) {
    const m = line.match(/^(\w+)\s*=\s*['"]?(.*?)['"]?\s*$/);
    if (m) {
      let val: unknown = m[2];
      if (val === "true") val = true;
      if (val === "false") val = false;
      if (/^\d+$/.test(String(val))) val = parseInt(String(val), 10);
      data[m[1]] = val;
    }
  }
  return { data, body };
}

function slugFromDir(name: string) {
  return name.toLowerCase();
}

function readBody(body: string): { bodyMd: string; audioUrl: string | null } {
  let audioUrl: string | null = null;
  const audioMatch = AUDIO_RE.exec(body);
  if (audioMatch) audioUrl = audioMatch[1];
  AUDIO_RE.lastIndex = 0;
  let cleaned = body.replace(AUDIO_RE, "").trim();

  const include = INCLUDE_RE.exec(cleaned);
  if (include) {
    const [, incLang, incFile] = include;
    const livesPath = path.join(CONTENT_DIR, incLang, "lives", incFile);
    if (fs.existsSync(livesPath)) {
      cleaned = fs.readFileSync(livesPath, "utf-8").trim();
    } else {
      console.warn(`  WARN missing: ${livesPath}`);
    }
  }
  return { bodyMd: cleaned, audioUrl };
}

function parseDay(description: string, sortWeight: number): number | null {
  if (!description) return sortWeight || null;
  const parts = description.trim().split(/\s+/);
  if (parts[0] && /^\d+$/.test(parts[0])) return parseInt(parts[0], 10);
  return sortWeight || null;
}

async function ensureSections() {
  const map = new Map<string, string>();
  for (const s of SECTION_CONFIG) {
    const section = await prisma.section.upsert({
      where: { slug: s.slug },
      create: s,
      update: { sortOrder: s.sortOrder },
    });
    map.set(s.slug, section.id);
  }

  for (const lang of ["en", "ru"] as const) {
    for (const monthDir of [...MONTH_DIRS, "triodion"]) {
      const idx = path.join(CONTENT_DIR, lang, monthDir, "_index.md");
      if (!fs.existsSync(idx)) continue;
      const { data } = parseFrontMatter(fs.readFileSync(idx, "utf-8"));
      const title = data.title as string;
      if (!title) continue;
      const slug = slugFromDir(monthDir);
      await prisma.section.update({
        where: { slug },
        data: lang === "en" ? { titleEn: title } : { titleRu: title },
      });
    }
  }
  return map;
}

async function importLang(lang: Language, slugToId: Map<string, string>) {
  const stats: Record<string, number> = {};
  const langDir = path.join(CONTENT_DIR, lang);
  if (!fs.existsSync(langDir)) {
    console.error(`Missing ${langDir}`);
    return stats;
  }

  const home = path.join(langDir, "_index.md");
  if (fs.existsSync(home)) {
    const { body } = parseFrontMatter(fs.readFileSync(home, "utf-8"));
    await prisma.sitePage.upsert({
      where: { language: lang },
      create: { language: lang, bodyMd: body.trim() },
      update: { bodyMd: body.trim() },
    });
  }

  const sections = [
    ...MONTH_DIRS.map((d) => [d, slugFromDir(d)] as const),
    ["triodion", "triodion"] as const,
  ];

  for (const [dirName, sectionSlug] of sections) {
    const sectionPath = path.join(langDir, dirName);
    if (!fs.existsSync(sectionPath)) continue;
    const sectionId = slugToId.get(sectionSlug)!;
    const isTriodion = sectionSlug === "triodion";
    let count = 0;

    for (const file of fs.readdirSync(sectionPath).sort()) {
      if (!file.endsWith(".md") || file === "_index.md") continue;
      const raw = fs.readFileSync(path.join(sectionPath, file), "utf-8");
      const { data, body } = parseFrontMatter(raw);
      const { bodyMd, audioUrl } = readBody(body);

      const linkTitle = String(data.linkTitle || data.title || path.basename(file, ".md"));
      const calendarLabel = String(data.description || "");
      const sortWeight = Number(data.weight) || 0;
      const dayOfMonth = isTriodion ? null : parseDay(calendarLabel, sortWeight);
      const isDraft = Boolean(data.draft);
      const slug = path.basename(file, ".md");

      await prisma.saintEntry.upsert({
        where: {
          language_sectionId_slug: {
            language: lang,
            sectionId,
            slug,
          },
        },
        create: {
          language: lang,
          sectionId,
          slug,
          linkTitle,
          calendarLabel,
          dayOfMonth,
          sortWeight,
          bodyMd,
          audioUrl,
          isDraft,
        },
        update: {
          linkTitle,
          calendarLabel,
          dayOfMonth,
          sortWeight,
          bodyMd,
          audioUrl,
          isDraft,
        },
      });
      count++;
    }
    stats[`${lang}/${sectionSlug}`] = count;
    console.log(`  ${lang}/${sectionSlug}: ${count}`);
  }
  return stats;
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`CONTENT_DIR not found: ${CONTENT_DIR}`);
    console.error(
      `Clone the Hugo site first: npm run content:fetch\n` +
        `(expected default: ${DEFAULT_CONTENT_DIR})`
    );
    process.exit(1);
  }
  console.log(`Importing from ${CONTENT_DIR}`);
  const slugToId = await ensureSections();
  let total = 0;
  for (const lang of ["en", "ru"] as const) {
    console.log(`\nLanguage: ${lang}`);
    const stats = await importLang(lang, slugToId);
    total += Object.values(stats).reduce((a, b) => a + b, 0);
  }
  console.log(`\n=== Import complete: ${total} entries ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

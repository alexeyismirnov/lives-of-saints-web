import Link from "next/link";
import { DayHeading } from "@/components/ui/Ornament";
import type { EntryGroup } from "@/lib/sections";
import type { Lang } from "@/lib/constants";

function EntryLinks({
  entries,
  lang,
  sectionSlug,
}: {
  entries: { slug: string; linkTitle: string; calendarLabel: string }[];
  lang: Lang;
  sectionSlug: string;
}) {
  return (
    <ul className="space-y-0.5 border-l border-gold-500/30 pl-4">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link
            href={`/${lang}/${sectionSlug}/${entry.slug}/`}
            className="block rounded-sm py-2 pl-2 font-serif text-ink-800 transition hover:bg-parchment-200/60 hover:text-wine-800"
          >
            {entry.linkTitle}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ChapterIndex({
  groups,
  lang,
  sectionSlug,
  isTriodion,
}: {
  groups: EntryGroup[];
  lang: Lang;
  sectionSlug: string;
  isTriodion: boolean;
}) {
  if (groups.length === 0) {
    return (
      <p className="font-serif italic text-ink-600">
        {lang === "ru" ? "В этом разделе пока нет записей." : "No entries in this section yet."}
      </p>
    );
  }

  if (isTriodion) {
    const listGroup = groups.find((g) => g.type === "list");
    if (!listGroup || listGroup.type !== "list") return null;
    return (
      <ul className="divide-y divide-gold-500/25 rounded-sm border border-gold-600/20 bg-parchment-100/50">
        {listGroup.entries.map((entry) => (
          <li key={entry.slug} className="px-5 py-4">
            <Link
              href={`/${lang}/${sectionSlug}/${entry.slug}/`}
              className="font-display text-lg font-medium text-wine-900 transition hover:text-gold-700"
            >
              {entry.linkTitle}
            </Link>
            {entry.calendarLabel && (
              <p className="mt-1 font-sans text-xs uppercase tracking-wide text-ink-600">
                {entry.calendarLabel}
              </p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => {
        if (group.type !== "day") return null;
        return (
          <section key={group.day}>
            <DayHeading label={group.label} />
            <EntryLinks
              entries={group.entries}
              lang={lang}
              sectionSlug={sectionSlug}
            />
          </section>
        );
      })}
    </div>
  );
}

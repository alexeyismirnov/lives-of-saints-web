import { prisma } from "@/lib/db";
import { TRIODION_SLUG, type Lang } from "@/lib/constants";

export { sectionTitle } from "@/lib/constants";

export async function getSections() {
  return prisma.section.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getSectionBySlug(slug: string) {
  return prisma.section.findUnique({ where: { slug } });
}

/** Next sortWeight for a new Triodion entry (appended at end). */
export async function getNextTriodionSortWeight(
  sectionId: string,
  language: Lang
): Promise<number> {
  const result = await prisma.saintEntry.aggregate({
    where: { sectionId, language },
    _max: { sortWeight: true },
  });
  return (result._max.sortWeight ?? 0) + 1;
}

export async function isTriodionSection(sectionId: string): Promise<boolean> {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { slug: true },
  });
  return section?.slug === TRIODION_SLUG;
}

export async function getSectionEntries(sectionId: string, lang: Lang) {
  return prisma.saintEntry.findMany({
    where: {
      sectionId,
      language: lang,
      isDraft: false,
    },
    orderBy: [
      { dayOfMonth: { sort: "asc", nulls: "last" } },
      { sortWeight: "asc" },
      { slug: "asc" },
    ],
  });
}

export type EntryGroup =
  | { type: "day"; day: number; label: string; entries: Awaited<ReturnType<typeof getSectionEntries>> }
  | { type: "list"; entries: Awaited<ReturnType<typeof getSectionEntries>> };

export function groupEntriesByDay(
  entries: Awaited<ReturnType<typeof getSectionEntries>>,
  isTriodion: boolean
): EntryGroup[] {
  if (isTriodion) {
    return [{ type: "list", entries }];
  }

  const groups = new Map<number, typeof entries>();
  for (const entry of entries) {
    const day = entry.dayOfMonth ?? entry.sortWeight;
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(entry);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, dayEntries]) => ({
      type: "day" as const,
      day,
      label: dayEntries[0]?.calendarLabel || String(day),
      entries: dayEntries,
    }));
}

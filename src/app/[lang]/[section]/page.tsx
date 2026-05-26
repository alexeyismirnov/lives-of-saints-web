import { notFound } from "next/navigation";
import { ChapterIndex } from "@/components/reader/ChapterIndex";
import { PageHeading } from "@/components/ui/Ornament";
import { isLang, TRIODION_SLUG } from "@/lib/constants";
import {
  getSectionBySlug,
  getSectionEntries,
  groupEntriesByDay,
  sectionTitle,
} from "@/lib/sections";

export default async function SectionIndexPage({
  params,
}: {
  params: Promise<{ lang: string; section: string }>;
}) {
  const { lang, section: sectionSlug } = await params;
  if (!isLang(lang)) notFound();

  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  const entries = await getSectionEntries(section.id, lang);
  const isTriodion = sectionSlug === TRIODION_SLUG;
  const groups = groupEntriesByDay(entries, isTriodion);

  return (
    <article>
      <PageHeading
        title={sectionTitle(section, lang)}
        align="left"
      />
      <ChapterIndex
        groups={groups}
        lang={lang}
        sectionSlug={sectionSlug}
        isTriodion={isTriodion}
      />
    </article>
  );
}

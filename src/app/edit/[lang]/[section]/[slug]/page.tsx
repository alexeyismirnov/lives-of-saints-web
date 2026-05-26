import { notFound } from "next/navigation";
import { EntryEditorForm } from "@/components/editor/EntryEditorForm";
import { PageHeading } from "@/components/ui/Ornament";
import { isLang } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getSectionBySlug, getSections } from "@/lib/sections";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}) {
  const { lang, section: sectionSlug, slug } = await params;
  if (!isLang(lang)) notFound();

  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  const entry = await prisma.saintEntry.findFirst({
    where: { language: lang, sectionId: section.id, slug },
  });
  if (!entry) notFound();

  const sections = await getSections();

  return (
    <>
      <PageHeading
        title={entry.linkTitle}
        subtitle="Edit entry"
        align="left"
      />
      <EntryEditorForm
        sections={sections}
        preserveAudioUrl={entry.audioUrl}
        initial={{
          id: entry.id,
          linkTitle: entry.linkTitle,
          slug: entry.slug,
          language: lang,
          sectionId: entry.sectionId,
          dayOfMonth: entry.dayOfMonth,
          sortWeight: entry.sortWeight,
          calendarLabel: entry.calendarLabel,
          bodyMd: entry.bodyMd,
          isDraft: entry.isDraft,
        }}
      />
    </>
  );
}

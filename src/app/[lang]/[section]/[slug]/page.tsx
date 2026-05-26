import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/reader/AudioPlayer";
import { EntryActions } from "@/components/reader/EntryActions";
import { MarkdownContent } from "@/components/reader/MarkdownContent";
import { getSession } from "@/lib/auth";
import { isLang } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getSectionBySlug, sectionTitle } from "@/lib/sections";

export default async function SaintArticlePage({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}) {
  const { lang, section: sectionSlug, slug } = await params;
  if (!isLang(lang)) notFound();

  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  const entry = await prisma.saintEntry.findFirst({
    where: {
      language: lang,
      sectionId: section.id,
      slug,
      isDraft: false,
    },
  });
  if (!entry) notFound();

  const session = await getSession();

  return (
    <article>
      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="breadcrumb">
          <Link href={`/${lang}/${sectionSlug}/`}>
            {sectionTitle(section, lang)}
          </Link>
          {entry.calendarLabel && (
            <>
              {" "}
              · <span>{entry.calendarLabel}</span>
            </>
          )}
        </p>
        {session?.user && (
          <EntryActions
            entryId={entry.id}
            lang={lang}
            sectionSlug={sectionSlug}
            slug={slug}
            linkTitle={entry.linkTitle}
          />
        )}
      </div>

      {entry.audioUrl && <AudioPlayer url={entry.audioUrl} />}

      <div className="prose-manuscript prose max-w-none">
        <MarkdownContent content={entry.bodyMd} />
      </div>
    </article>
  );
}

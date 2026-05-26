import Link from "next/link";
import { EntryEditorForm } from "@/components/editor/EntryEditorForm";
import { PageHeading } from "@/components/ui/Ornament";
import { isLang } from "@/lib/constants";
import { buildCalendarLabel } from "@/lib/entry-meta";
import { getSections } from "@/lib/sections";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; section?: string }>;
}) {
  const params = await searchParams;
  const sections = await getSections();

  const lang = params.lang && isLang(params.lang) ? params.lang : "en";
  const section =
    sections.find((s) => s.slug === params.section) ?? sections[0];

  if (!section) {
    return (
      <div className="font-sans text-sm text-ink-700">
        <p className="mb-4">
          Calendar sections are not in the database yet. Seed them, then import
          content:
        </p>
        <pre className="rounded-sm bg-parchment-200 p-4 font-mono text-xs text-ink-900">
          npm run content:fetch{"\n"}
          npm run db:seed-sections{"\n"}
          npm run import:content
        </pre>
        <p className="mt-4">
          <Link
            href="/en/"
            className="text-wine-700 underline decoration-gold-500/40 underline-offset-2"
          >
            Back to site
          </Link>
        </p>
      </div>
    );
  }

  const isTriodion = section.slug === "triodion";

  return (
    <>
      <PageHeading
        title="New entry"
        subtitle="Compose a saint’s life for the calendar"
        align="left"
      />
      <EntryEditorForm
        isNew
        sections={sections}
        initial={{
          linkTitle: "",
          slug: "",
          language: lang,
          sectionId: section.id,
          dayOfMonth: isTriodion ? null : 1,
          sortWeight: 1,
          calendarLabel: isTriodion
            ? ""
            : buildCalendarLabel(1, section.slug, lang),
          bodyMd: "",
          isDraft: false,
        }}
      />
    </>
  );
}

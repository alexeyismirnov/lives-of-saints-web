import { notFound } from "next/navigation";
import { PageHeading } from "@/components/ui/Ornament";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchResults } from "@/components/search/SearchResults";
import { isLang } from "@/lib/constants";
import { searchEntries, searchLabels } from "@/lib/search";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang: langParam } = await params;
  const { q = "" } = await searchParams;

  if (!isLang(langParam)) notFound();

  const query = q.trim();
  const results = query.length >= 2 ? await searchEntries(langParam, query, 50) : [];
  const labels = searchLabels(langParam);

  return (
    <article>
      <PageHeading
        title={labels.resultsTitle}
        subtitle={labels.hint}
        align="left"
      />
      <div className="mb-8">
        <SearchForm lang={langParam} initialQuery={query} />
      </div>
      {query.length >= 2 && (
        <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-wine-800">
          {labels.resultsFor(query)}
          <span className="ml-2 font-normal text-ink-600">
            ({results.length})
          </span>
        </h2>
      )}
      <SearchResults lang={langParam} query={query} results={results} />
    </article>
  );
}

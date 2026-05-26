import Link from "next/link";
import type { Lang } from "@/lib/constants";
import { searchLabels, type SearchResult } from "@/lib/search";

export function SearchResults({
  lang,
  query,
  results,
}: {
  lang: Lang;
  query: string;
  results: SearchResult[];
}) {
  const labels = searchLabels(lang);

  if (query.trim().length < 2) {
    return (
      <p className="font-serif text-ink-600">{labels.enterQuery}</p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="font-serif italic text-ink-600">{labels.noResults}</p>
    );
  }

  return (
    <ul className="divide-y divide-gold-600/20 border-y border-gold-600/20">
      {results.map((result) => (
        <li key={result.id}>
          <Link
            href={result.href}
            className="block py-4 transition hover:bg-parchment-200/40"
          >
            <span className="font-serif text-lg text-ink-900">
              {result.linkTitle}
            </span>
            <span className="mt-1 block font-sans text-sm text-wine-700/85">
              {result.sectionTitle}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

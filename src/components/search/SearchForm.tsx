"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/constants";
import { searchLabels } from "@/lib/search";

export function SearchForm({
  lang,
  initialQuery = "",
}: {
  lang: Lang;
  initialQuery?: string;
}) {
  const labels = searchLabels(lang);
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(
          q.length >= 2
            ? `/${lang}/search/?q=${encodeURIComponent(q)}`
            : `/${lang}/search/`
        );
      }}
      className="flex gap-2"
    >
      <label htmlFor="search-page-input" className="sr-only">
        {labels.ariaLabel}
      </label>
      <input
        id="search-page-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={labels.placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-sm border border-gold-600/35 bg-parchment-50 px-3 py-2 font-sans text-ink-900 placeholder:text-ink-500/60 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
      />
      <button type="submit" className="btn-primary shrink-0">
        {lang === "ru" ? "Искать" : "Search"}
      </button>
    </form>
  );
}

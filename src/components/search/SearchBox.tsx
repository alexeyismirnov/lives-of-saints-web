"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Lang } from "@/lib/constants";
import { searchLabels, type SearchResult } from "@/lib/search";

const DEBOUNCE_MS = 200;
const DROPDOWN_LIMIT = 8;

export function SearchBox({ lang }: { lang: Lang }) {
  const labels = searchLabels(lang);
  const listId = useId();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= 2;

  const fetchResults = useCallback(
    async (q: string, signal: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lang,
          q,
          limit: String(DROPDOWN_LIMIT),
        });
        const res = await fetch(`/api/search/?${params}`, { signal });
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setActiveIndex(data.results.length > 0 ? 0 : -1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetchResults(trimmed, controller.signal);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, canSearch, fetchResults]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goToSearchPage = () => {
    if (!canSearch) return;
    setOpen(false);
    router.push(`/${lang}/search/?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        setOpen(false);
        router.push(results[activeIndex].href);
        return;
      }
      goToSearchPage();
    }
  };

  const showDropdown = open && (canSearch || trimmed.length > 0);

  return (
    <div ref={rootRef} className="relative hidden min-w-0 flex-1 sm:block sm:max-w-xs md:max-w-sm">
      <label htmlFor={`search-${listId}`} className="sr-only">
        {labels.ariaLabel}
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          id={`search-${listId}`}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={labels.placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listId : undefined}
          aria-autocomplete="list"
          className="w-full rounded-sm border border-gold-600/35 bg-wine-950/40 py-1.5 pl-9 pr-3 font-sans text-sm text-parchment-100 placeholder:text-parchment-300/60 focus:border-gold-500/60 focus:bg-wine-950/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
        />
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-[min(24rem,70vh)] overflow-y-auto rounded-sm border border-gold-600/30 bg-parchment-50 shadow-manuscript-lg"
          role="listbox"
          id={listId}
        >
          {!canSearch && (
            <p className="px-3 py-2 font-sans text-sm text-ink-600">
              {labels.enterQuery}
            </p>
          )}
          {canSearch && loading && (
            <p className="px-3 py-2 font-sans text-sm text-ink-600">
              {labels.searching}
            </p>
          )}
          {canSearch && !loading && results.length === 0 && (
            <p className="px-3 py-2 font-sans text-sm text-ink-600">
              {labels.noResults}
            </p>
          )}
          {canSearch &&
            !loading &&
            results.map((result, index) => (
              <Link
                key={result.id}
                href={result.href}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => setOpen(false)}
                className={`block border-b border-gold-600/15 px-3 py-2.5 transition last:border-b-0 ${
                  index === activeIndex
                    ? "bg-parchment-200/80"
                    : "hover:bg-parchment-200/60"
                }`}
              >
                <span className="block font-serif text-ink-900">
                  {result.linkTitle}
                </span>
                <span className="mt-0.5 block font-sans text-xs text-wine-700/80">
                  {result.sectionTitle}
                </span>
              </Link>
            ))}
          {canSearch && !loading && results.length > 0 && (
            <button
              type="button"
              onClick={goToSearchPage}
              className="w-full border-t border-gold-600/25 px-3 py-2 text-left font-sans text-sm font-medium text-wine-800 transition hover:bg-parchment-200/80"
            >
              {labels.viewAll} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

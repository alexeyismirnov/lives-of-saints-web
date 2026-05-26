import Fuse from "fuse.js";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { isLang, sectionTitle, type Lang } from "@/lib/constants";

export type SearchCatalogItem = {
  id: string;
  linkTitle: string;
  slug: string;
  sectionSlug: string;
  sectionTitle: string;
};

export type SearchResult = SearchCatalogItem & {
  href: string;
};

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

async function fetchSearchCatalog(lang: Lang): Promise<SearchCatalogItem[]> {
  const entries = await prisma.saintEntry.findMany({
    where: { language: lang, isDraft: false },
    select: {
      id: true,
      linkTitle: true,
      slug: true,
      section: { select: { slug: true, titleEn: true, titleRu: true } },
    },
    orderBy: { linkTitle: "asc" },
  });

  return entries.map((entry) => ({
    id: entry.id,
    linkTitle: entry.linkTitle,
    slug: entry.slug,
    sectionSlug: entry.section.slug,
    sectionTitle: sectionTitle(entry.section, lang),
  }));
}

function getCachedCatalog(lang: Lang) {
  return unstable_cache(
    () => fetchSearchCatalog(lang),
    ["search-catalog", lang],
    { revalidate: 300 }
  );
}

export async function getSearchCatalog(lang: Lang): Promise<SearchCatalogItem[]> {
  return getCachedCatalog(lang)();
}

function fuseSearch(
  catalog: SearchCatalogItem[],
  query: string,
  limit: number
): SearchCatalogItem[] {
  const fuse = new Fuse(catalog, {
    keys: ["linkTitle"],
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  });

  return fuse.search(query, { limit }).map(({ item }) => item);
}

/** Fuzzy search on entry titles (`linkTitle`) for the given language. */
export async function searchEntries(
  lang: Lang,
  query: string,
  limit = DEFAULT_LIMIT
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH || !isLang(lang)) {
    return [];
  }

  const cappedLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
  const catalog = await getSearchCatalog(lang);

  return fuseSearch(catalog, trimmed, cappedLimit).map((item) => ({
    ...item,
    href: `/${lang}/${item.sectionSlug}/${item.slug}/`,
  }));
}

export function searchLabels(lang: Lang) {
  return lang === "ru"
    ? {
        placeholder: "Поиск по имени святого…",
        ariaLabel: "Поиск святых",
        noResults: "Ничего не найдено",
        searching: "Поиск…",
        viewAll: "Все результаты",
        resultsTitle: "Результаты поиска",
        resultsFor: (q: string) => `Результаты для «${q}»`,
        enterQuery: "Введите не менее двух символов.",
        hint: "Поиск только по названию жития, не по тексту.",
      }
    : {
        placeholder: "Search saint by name…",
        ariaLabel: "Search saints",
        noResults: "No matches",
        searching: "Searching…",
        viewAll: "View all results",
        resultsTitle: "Search",
        resultsFor: (q: string) => `Results for “${q}”`,
        enterQuery: "Type at least two characters to search.",
        hint: "Searches entry titles only, not article text.",
      };
}

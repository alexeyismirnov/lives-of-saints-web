import slugify from "slugify";
import type { Lang } from "@/lib/constants";

/** Russian month names in genitive case (for calendar labels like «3 мая»). */
export const RU_MONTH_GENITIVE: Record<string, string> = {
  january: "января",
  february: "февраля",
  march: "марта",
  april: "апреля",
  may: "мая",
  june: "июня",
  july: "июля",
  august: "августа",
  september: "сентября",
  october: "октября",
  november: "ноября",
  december: "декабря",
};

export const EN_MONTH_NAMES: Record<string, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
};

export function buildCalendarLabel(
  day: number | null,
  sectionSlug: string,
  lang: Lang
): string {
  if (!day || sectionSlug === "triodion") return "";

  if (lang === "ru") {
    const month = RU_MONTH_GENITIVE[sectionSlug];
    return month ? `${day} ${month}` : `${day}`;
  }

  const month = EN_MONTH_NAMES[sectionSlug];
  return month ? `${day} ${month}` : `${day}`;
}

/**
 * URL slug from display title. Russian titles are transliterated to Latin.
 */
export function slugFromTitle(title: string, lang: Lang): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const slug = slugify(trimmed, {
    lower: true,
    strict: true,
    locale: lang === "ru" ? "ru" : "en",
  });

  return slug || "";
}

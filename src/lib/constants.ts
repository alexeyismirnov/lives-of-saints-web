export const LANGUAGES = ["en", "ru"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ru: "Russian",
};

export const SITE_TITLES: Record<Lang, string> = {
  en: "Lives of Saints",
  ru: "Жития святых",
};

export function isLang(value: string): value is Lang {
  return LANGUAGES.includes(value as Lang);
}

export const MONTH_SLUGS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const TRIODION_SLUG = "triodion";

export function sectionTitle(
  section: { titleEn: string; titleRu: string },
  lang: Lang
) {
  return lang === "ru" ? section.titleRu : section.titleEn;
}

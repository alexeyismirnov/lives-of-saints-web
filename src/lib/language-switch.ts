import { isLang, type Lang } from "@/lib/constants";

/**
 * Target URL when switching site language.
 * Month indexes keep the same section; saint pages have no EN/RU slug pairs → home.
 */
export function languageSwitchPath(
  pathname: string | null,
  targetLang: Lang
): string {
  const home = `/${targetLang}/`;
  if (!pathname) return home;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return home;

  const routeLang = parts[0];
  if (!isLang(routeLang)) return home;

  if (parts.length === 1) return home;

  // /{lang}/{section}/ — month or triodion index
  if (parts.length === 2) {
    return `/${targetLang}/${parts[1]}/`;
  }

  // /{lang}/{section}/{slug}/ and anything deeper → language home
  return home;
}

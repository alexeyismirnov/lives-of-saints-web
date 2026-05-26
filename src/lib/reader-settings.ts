import type { Lang } from "@/lib/constants";

export type ReaderFontSize = "medium" | "large" | "xlarge";

/** Persisted in the browser via localStorage. */
export const READER_FONT_SIZE_KEY = "reader-font-size";

export const FONT_SIZE_OPTIONS: {
  id: ReaderFontSize;
  labelEn: string;
  labelRu: string;
}[] = [
  { id: "medium", labelEn: "Small", labelRu: "Мелкий" },
  { id: "large", labelEn: "Medium", labelRu: "Средний" },
  { id: "xlarge", labelEn: "Large", labelRu: "Крупный" },
];

export function fontSizeLabel(id: ReaderFontSize, lang: Lang): string {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.id === id);
  if (!opt) return id;
  return lang === "ru" ? opt.labelRu : opt.labelEn;
}

export function isReaderFontSize(value: string): value is ReaderFontSize {
  return FONT_SIZE_OPTIONS.some((o) => o.id === value);
}

export function getStoredFontSize(): ReaderFontSize {
  if (typeof window === "undefined") return "medium";
  const stored = localStorage.getItem(READER_FONT_SIZE_KEY);
  if (stored === "small") return "medium";
  if (stored && isReaderFontSize(stored)) return stored;
  return "medium";
}

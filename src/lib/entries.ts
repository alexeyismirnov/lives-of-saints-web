import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/constants";

export async function slugExists(
  language: Lang,
  sectionId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.saintEntry.findFirst({
    where: {
      language,
      sectionId,
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!existing;
}

/** First available slug: `base`, then `base-2`, `base-3`, … */
export async function resolveUniqueSlug(
  language: Lang,
  sectionId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const base = baseSlug.trim();
  if (!base) return "";

  if (!(await slugExists(language, sectionId, base, excludeId))) {
    return base;
  }

  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!(await slugExists(language, sectionId, candidate, excludeId))) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

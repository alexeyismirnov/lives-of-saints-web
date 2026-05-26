/**
 * Ensure calendar sections exist (required before editor / import).
 * Usage: npx tsx --env-file=.env scripts/seed_sections.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SECTIONS = [
  { slug: "january", sortOrder: 1, titleEn: "January", titleRu: "Январь" },
  { slug: "february", sortOrder: 2, titleEn: "February", titleRu: "Февраль" },
  { slug: "march", sortOrder: 3, titleEn: "March", titleRu: "Март" },
  { slug: "april", sortOrder: 4, titleEn: "April", titleRu: "Апрель" },
  { slug: "may", sortOrder: 5, titleEn: "May", titleRu: "Май" },
  { slug: "june", sortOrder: 6, titleEn: "June", titleRu: "Июнь" },
  { slug: "july", sortOrder: 7, titleEn: "July", titleRu: "Июль" },
  { slug: "august", sortOrder: 8, titleEn: "August", titleRu: "Август" },
  { slug: "september", sortOrder: 9, titleEn: "September", titleRu: "Сентябрь" },
  { slug: "october", sortOrder: 10, titleEn: "October", titleRu: "Октябрь" },
  { slug: "november", sortOrder: 11, titleEn: "November", titleRu: "Ноябрь" },
  { slug: "december", sortOrder: 12, titleEn: "December", titleRu: "Декабрь" },
  { slug: "triodion", sortOrder: 13, titleEn: "Triodion", titleRu: "Триодион" },
] as const;

async function main() {
  for (const s of SECTIONS) {
    await prisma.section.upsert({
      where: { slug: s.slug },
      create: s,
      update: { sortOrder: s.sortOrder, titleEn: s.titleEn, titleRu: s.titleRu },
    });
  }
  console.log(`Seeded ${SECTIONS.length} sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { notFound } from "next/navigation";
import { isLang } from "@/lib/constants";
import { getSectionBySlug } from "@/lib/sections";

export default async function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; section: string }>;
}) {
  const { lang, section: sectionSlug } = await params;
  if (!isLang(lang)) notFound();

  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  return children;
}

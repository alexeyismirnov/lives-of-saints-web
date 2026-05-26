import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/reader/MarkdownContent";
import { PageHeading } from "@/components/ui/Ornament";
import { isLang, SITE_TITLES } from "@/lib/constants";
import { prisma } from "@/lib/db";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const sitePage = await prisma.sitePage.findUnique({
    where: { language: lang },
  });

  const subtitle =
    lang === "ru" ? "Жития святых православной Церкви" : "Lives of the Orthodox saints";

  return (
    <article>
      <PageHeading title={SITE_TITLES[lang]} subtitle={subtitle} />
      {sitePage?.bodyMd ? (
        <div className="prose-manuscript prose max-w-none">
          <MarkdownContent content={sitePage.bodyMd} />
        </div>
      ) : (
        <p className="text-center font-serif italic text-ink-600">Welcome.</p>
      )}
    </article>
  );
}

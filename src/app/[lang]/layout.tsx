import { notFound } from "next/navigation";
import {
  DatabaseSetupRequired,
  isDatabaseConfigured,
  isDatabaseConnectionError,
} from "@/components/DatabaseSetupRequired";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";
import { isLang } from "@/lib/constants";
import { getSections } from "@/lib/sections";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  if (!isDatabaseConfigured()) {
    return <DatabaseSetupRequired reason="missing-env" />;
  }

  let sections;
  try {
    sections = await getSections();
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseSetupRequired reason="unreachable" />;
    }
    throw error;
  }

  const session = await getSession();

  return (
    <AppShell lang={lang} sections={sections} isLoggedIn={!!session?.user}>
      {children}
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import {
  DatabaseSetupRequired,
  isDatabaseConfigured,
  isDatabaseConnectionError,
} from "@/components/DatabaseSetupRequired";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";
import { getSections } from "@/lib/sections";
import "../editor.css";

export default async function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDatabaseConfigured()) {
    return <DatabaseSetupRequired reason="missing-env" />;
  }

  const session = await getSession();
  if (!session?.user) {
    redirect("/login/?callbackUrl=/edit/new/");
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

  return (
    <AppShell lang="en" sections={sections} isLoggedIn>
      <div className="mb-6 border-b border-gold-600/25 pb-4">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
          Editor
        </p>
      </div>
      {children}
    </AppShell>
  );
}

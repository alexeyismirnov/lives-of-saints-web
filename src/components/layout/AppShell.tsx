"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { Lang } from "@/lib/constants";
import type { Section } from "@prisma/client";

export function AppShell({
  lang,
  sections,
  isLoggedIn,
  children,
}: {
  lang: Lang;
  sections: Section[];
  isLoggedIn?: boolean;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lang={lang}
        isLoggedIn={isLoggedIn}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-wine-950/50 backdrop-blur-sm lg:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-[3.25rem] z-40 h-[calc(100vh-3.25rem)] w-64 shrink-0 transform transition-transform lg:sticky lg:top-[3.25rem] lg:z-0 lg:self-start ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar
            sections={sections}
            lang={lang}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        <main className="reader-content flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8">
          <div className="manuscript-sheet mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

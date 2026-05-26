"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sectionTitle } from "@/lib/constants";
import type { Lang } from "@/lib/constants";
import type { Section } from "@prisma/client";

export function Sidebar({
  sections,
  lang,
  onNavigate,
}: {
  sections: Section[];
  lang: Lang;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const parts = pathname?.split("/").filter(Boolean) ?? [];
  const activeSectionSlug = parts[1] && parts[0] === lang ? parts[1] : undefined;

  const calendarLabel = lang === "ru" ? "Календарь" : "Calendar";

  return (
    <nav
      aria-label="Calendar sections"
      className="flex h-full max-h-[calc(100vh-3.25rem)] flex-col border-r border-gold-600/25 bg-parchment-100"
    >
      <div className="border-b border-gold-600/20 px-4 py-4">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-700">
          {calendarLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {sections.map((section) => {
          const isActive = section.slug === activeSectionSlug;
          return (
            <Link
              key={section.id}
              href={`/${lang}/${section.slug}/`}
              onClick={onNavigate}
              className={`rounded-sm border-l-2 px-3 py-2.5 font-sans text-sm transition ${
                isActive
                  ? "border-gold-600 bg-wine-800/90 font-medium text-parchment-50 shadow-sm"
                  : "border-transparent text-ink-700 hover:border-gold-500/40 hover:bg-parchment-200/80 hover:text-wine-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {sectionTitle(section, lang)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

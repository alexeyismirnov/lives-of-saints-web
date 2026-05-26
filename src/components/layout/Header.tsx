"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SITE_TITLES, type Lang } from "@/lib/constants";
import { languageSwitchPath } from "@/lib/language-switch";
import { SearchBox } from "@/components/search/SearchBox";
import { SettingsMenu } from "./SettingsMenu";

export function Header({
  lang,
  onMenuClick,
  isLoggedIn,
}: {
  lang: Lang;
  onMenuClick?: () => void;
  isLoggedIn?: boolean;
}) {
  const pathname = usePathname();
  const otherLang: Lang = lang === "en" ? "ru" : "en";
  const otherLangHref = languageSwitchPath(pathname, otherLang);

  return (
    <header className="sticky top-0 z-50 border-b border-gold-600/30 bg-wine-900 shadow-md">
      <div className="flex h-[3.25rem] items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-sm p-2 text-parchment-200 hover:bg-wine-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link
          href={`/${lang}/`}
          className="group flex flex-col leading-none"
        >
          <span className="font-display text-xl font-semibold tracking-wide text-parchment-50 transition group-hover:text-gold-400 md:text-2xl">
            {SITE_TITLES[lang]}
          </span>
          <span className="mt-0.5 hidden font-sans text-[10px] uppercase tracking-[0.2em] text-gold-500/90 sm:block">
            {lang === "ru" ? "Чтения на каждый день" : "Daily readings"}
          </span>
        </Link>

        <SearchBox lang={lang} />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${lang}/search/`}
            className="rounded-sm border border-gold-600/40 p-2 text-gold-400 transition hover:bg-wine-800 hover:text-parchment-50 sm:hidden"
            aria-label={lang === "ru" ? "Поиск" : "Search"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          <SettingsMenu lang={lang} variant="dark" />

          <nav
            aria-label="Language"
            className="flex overflow-hidden rounded-sm border border-gold-600/40 text-sm"
          >
            {(["en", "ru"] as const).map((l) => (
              <Link
                key={l}
                href={l === lang ? pathname || `/${l}/` : otherLangHref}
                className={`px-3 py-1.5 font-sans font-medium transition ${
                  l === lang
                    ? "bg-gold-600 text-wine-950"
                    : "text-parchment-200 hover:bg-wine-800 hover:text-parchment-50"
                }`}
                aria-current={l === lang ? "true" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/edit/new/"
                className="btn-primary hidden sm:inline-block"
              >
                {lang === "ru" ? "Новая запись" : "New entry"}
              </Link>
              <button
                type="button"
                onClick={() =>
                  signOut({ callbackUrl: `/${lang}/`, redirect: true })
                }
                className="rounded-sm border border-parchment-300/30 px-3 py-1.5 font-sans text-sm text-parchment-100 transition hover:border-gold-500/50 hover:text-gold-400"
              >
                {lang === "ru" ? "Выйти" : "Sign out"}
              </button>
            </div>
          ) : (
            <Link
              href="/login/"
              className="rounded-sm border border-gold-500/50 bg-gold-600/20 px-3 py-1.5 font-sans text-sm font-medium text-gold-400 transition hover:bg-gold-600/30 hover:text-parchment-50"
            >
              {lang === "ru" ? "Вход" : "Login"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

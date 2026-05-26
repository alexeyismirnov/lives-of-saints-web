"use client";

import { useEffect, useRef, useState } from "react";
import { useReaderSettings } from "@/components/providers/ReaderSettingsProvider";
import type { Lang } from "@/lib/constants";
import {
  FONT_SIZE_OPTIONS,
  fontSizeLabel,
  type ReaderFontSize,
} from "@/lib/reader-settings";

export function SettingsMenu({
  lang,
  variant = "light",
}: {
  lang: Lang;
  variant?: "light" | "dark";
}) {
  const { fontSize, setFontSize } = useReaderSettings();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const settingsLabel = lang === "ru" ? "Настройки" : "Settings";
  const fontSizeHeading = lang === "ru" ? "Размер шрифта" : "Font size";

  const triggerClass =
    variant === "dark"
      ? "rounded-sm border border-gold-600/40 p-2 text-gold-400 transition hover:bg-wine-800 hover:text-parchment-50"
      : "rounded-sm border border-gold-600/40 p-2 text-wine-700 transition hover:bg-parchment-200";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-label={settingsLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={settingsLabel}
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-sm border border-gold-600/30 bg-parchment-50 p-4 shadow-manuscript-lg"
        >
          <p className="mb-3 font-sans text-sm font-semibold text-wine-900">
            {fontSizeHeading}
          </p>
          <div className="flex flex-col gap-1">
            {FONT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setFontSize(opt.id as ReaderFontSize);
                  setOpen(false);
                }}
                className={`rounded-sm px-3 py-2 text-left font-sans text-sm transition ${
                  fontSize === opt.id
                    ? "bg-wine-800 font-medium text-parchment-50"
                    : "text-ink-800 hover:bg-parchment-200"
                }`}
              >
                {fontSizeLabel(opt.id, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

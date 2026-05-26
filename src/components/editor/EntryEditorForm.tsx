"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/constants";
import { buildCalendarLabel, slugFromTitle } from "@/lib/entry-meta";
import type { Section } from "@prisma/client";
import { RichTextMarkdownEditor } from "./RichTextMarkdownEditor";

type EntryData = {
  id?: string;
  linkTitle: string;
  slug: string;
  language: Lang;
  sectionId: string;
  dayOfMonth: number | null;
  sortWeight: number;
  calendarLabel: string;
  bodyMd: string;
  isDraft: boolean;
};

function applyDerivedFields(
  data: EntryData,
  sections: Section[],
  opts: {
    isNew: boolean;
    titleChanged?: boolean;
    dayOrSectionChanged?: boolean;
    languageChanged?: boolean;
  }
): EntryData {
  const section = sections.find((s) => s.id === data.sectionId);
  const isTriodion = section?.slug === "triodion";
  const next = { ...data };

  if (opts.dayOrSectionChanged && isTriodion) {
    next.dayOfMonth = null;
    next.calendarLabel = "";
  }

  if ((opts.dayOrSectionChanged || opts.languageChanged) && !isTriodion) {
    const day = next.dayOfMonth ?? next.sortWeight;
    if (day && section) {
      if (opts.dayOrSectionChanged) {
        next.sortWeight = day;
      }
      next.calendarLabel = buildCalendarLabel(day, section.slug, next.language);
    }
  }

  return next;
}

export function EntryEditorForm({
  sections,
  initial,
  isNew,
  preserveAudioUrl,
}: {
  sections: Section[];
  initial: EntryData;
  isNew?: boolean;
  /** Existing audio URL when editing (not shown in form). */
  preserveAudioUrl?: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    applyDerivedFields(initial, sections, { isNew: !!isNew, dayOrSectionChanged: true })
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugAdjusted, setSlugAdjusted] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);

  const section = sections.find((s) => s.id === form.sectionId);
  const isTriodion = section?.slug === "triodion";
  const sectionSlug = section?.slug ?? "";

  const update = (patch: Partial<EntryData>) => {
    setForm((prev) => {
      const merged = { ...prev, ...patch };
      return applyDerivedFields(merged, sections, {
        isNew: !!isNew,
        titleChanged: patch.linkTitle !== undefined,
        dayOrSectionChanged:
          patch.dayOfMonth !== undefined || patch.sectionId !== undefined,
        languageChanged: patch.language !== undefined,
      });
    });
  };

  useEffect(() => {
    if (!isNew) return;

    const title = form.linkTitle.trim();
    if (!title) {
      setForm((prev) => (prev.slug === "" ? prev : { ...prev, slug: "" }));
      setSlugAdjusted(false);
      setSlugChecking(false);
      return;
    }

    const controller = new AbortController();
    setSlugChecking(true);

    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        language: form.language,
        sectionId: form.sectionId,
        title,
      });
      try {
        const res = await fetch(`/api/entries/unique-slug/?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          slug: string;
          adjusted: boolean;
        };
        if (controller.signal.aborted) return;
        setForm((prev) => ({ ...prev, slug: data.slug }));
        setSlugAdjusted(data.adjusted);
      } catch {
        if (!controller.signal.aborted) {
          setForm((prev) => ({
            ...prev,
            slug: slugFromTitle(title, form.language),
          }));
        }
      } finally {
        if (!controller.signal.aborted) setSlugChecking(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [isNew, form.linkTitle, form.language, form.sectionId]);

  const submit = async () => {
    if (!form.bodyMd.trim()) {
      setError("Body text is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = isNew ? "/api/entries/" : `/api/entries/${form.id}/`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isDraft: false,
          audioUrl: isNew ? null : preserveAudioUrl ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const data = await res.json();
      const sectionSlug = sections.find((s) => s.id === form.sectionId)?.slug;
      router.push(`/${form.language}/${sectionSlug}/${data.slug}/`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-wine-800">Language</span>
          <select
            value={form.language}
            disabled={!isNew}
            onChange={(e) => update({ language: e.target.value as Lang })}
            className="mt-1 w-full rounded-sm border border-gold-600/30 px-3 py-2"
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-wine-800">Section</span>
          <select
            value={form.sectionId}
            onChange={(e) => update({ sectionId: e.target.value })}
            className="mt-1 w-full rounded-sm border border-gold-600/30 px-3 py-2"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {form.language === "ru" ? s.titleRu : s.titleEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-wine-800">Title</span>
        <input
          type="text"
          required
          value={form.linkTitle}
          onChange={(e) => update({ linkTitle: e.target.value })}
          className="mt-1 w-full rounded-sm border border-gold-600/30 px-3 py-2"
        />
        {isNew && form.linkTitle.trim() && (
          <p className="mt-1.5 font-sans text-sm text-ink-600">
            URL:{" "}
            {slugChecking ? (
              <span className="text-gold-700">checking…</span>
            ) : form.slug ? (
              <span className="font-mono text-wine-800">
                /{form.language}/{sectionSlug}/{form.slug}/
              </span>
            ) : (
              <span className="text-ink-500">—</span>
            )}
          </p>
        )}
        {isNew && slugAdjusted && form.slug && (
          <p className="mt-1 text-sm text-amber-800">
            This URL was adjusted because another entry in the same month already
            uses that slug.
          </p>
        )}
        {!isNew && (
          <p className="mt-1.5 font-sans text-sm text-ink-600">
            URL slug: <span className="font-mono text-wine-800">{form.slug}</span>
          </p>
        )}
      </label>

      {!isTriodion && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-wine-800">Day of month</span>
          <input
            type="number"
            min={1}
            max={31}
            required
            value={form.dayOfMonth ?? ""}
            onChange={(e) => {
              const day = e.target.value ? Number(e.target.value) : null;
              update({
                dayOfMonth: day,
                sortWeight: day ?? form.sortWeight,
              });
            }}
            className="w-full max-w-xs rounded-sm border border-gold-600/30 px-3 py-2"
          />
          {form.calendarLabel && (
            <p className="mt-1.5 font-sans text-sm text-ink-600">
              Calendar label:{" "}
              <span className="font-medium text-wine-800">{form.calendarLabel}</span>
            </p>
          )}
        </label>
      )}

      {isTriodion && isNew && (
        <p className="font-sans text-sm italic text-ink-600">
          New Triodion entries are added at the end of the list automatically.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-wine-800">Body</span>
        <RichTextMarkdownEditor
          value={form.bodyMd}
          onChange={(bodyMd) => update({ bodyMd })}
        />
        <p className="font-sans text-xs text-ink-500">
          Formatted visually; stored as Markdown in the database.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gold-600/25 pt-6">
        <button
          type="submit"
          disabled={saving || (isNew && (!form.slug || slugChecking))}
          className="btn-primary px-5 py-2.5 disabled:opacity-50"
        >
          {saving ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-sm px-5 py-2.5 font-sans text-sm text-ink-600 hover:bg-parchment-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

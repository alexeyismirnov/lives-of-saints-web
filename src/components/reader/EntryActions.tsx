"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/constants";

export function EntryActions({
  entryId,
  lang,
  sectionSlug,
  slug,
  linkTitle,
}: {
  entryId: string;
  lang: Lang;
  sectionSlug: string;
  slug: string;
  linkTitle: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const editLabel = lang === "ru" ? "Изменить" : "Edit";
  const deleteLabel = lang === "ru" ? "Удалить" : "Delete";

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete “${linkTitle}”?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entryId}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not delete this entry.");
        return;
      }
      router.push(`/${lang}/${sectionSlug}/`);
      router.refresh();
    } catch {
      alert("Could not delete this entry.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={`/edit/${lang}/${sectionSlug}/${slug}/`}
        className="btn-secondary text-xs sm:text-sm"
      >
        {editLabel}
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 font-sans text-xs font-medium text-red-900 transition hover:bg-red-100 disabled:opacity-50 sm:text-sm"
      >
        {deleting ? "…" : deleteLabel}
      </button>
    </div>
  );
}

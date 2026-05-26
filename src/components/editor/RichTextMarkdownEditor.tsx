"use client";

import dynamic from "next/dynamic";

const EditorLoading = () => (
  <div
    className="flex min-h-[22rem] items-center justify-center rounded-sm border border-gold-600/30 bg-parchment-100 font-sans text-sm text-ink-600"
    aria-hidden
  >
    Loading editor…
  </div>
);

/** Client-only; must not be imported from Server Components. */
export const RichTextMarkdownEditor = dynamic(
  () => import("./RichTextMarkdownEditorInner"),
  {
    ssr: false,
    loading: EditorLoading,
  }
);

"use client";

import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  linkPlugin,
  linkDialogPlugin,
  CreateLink,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "@/app/editor.css";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
};

export default function RichTextMarkdownEditorInner({
  value,
  onChange,
  placeholder = "Write the life of the saint…",
}: Props) {
  const editorRef = useRef<MDXEditorMethods>(null);

  // Sync when loading a different entry (edit page navigation)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.getMarkdown();
    if (current !== value) {
      editor.setMarkdown(value);
    }
  }, [value]);

  return (
    <div className="rich-text-editor overflow-hidden rounded-sm border border-gold-600/30 bg-parchment-50">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-brand max-w-none min-h-[20rem] px-4 py-3 focus:outline-none"
        plugins={[
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarClassName: "border-b border-gold-600/25 bg-parchment-100 px-2 py-1",
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle />
                <CreateLink />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}

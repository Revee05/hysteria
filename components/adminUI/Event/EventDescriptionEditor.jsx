"use client";

import dynamic from "next/dynamic";

const TextEditor = dynamic(
  () =>
    import("@/components/tiptap-templates/simple/simple-editor").then(
      (mod) => mod.SimpleEditor
    ),
  { ssr: false }
);

export default function ArticleTextEditor({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <TextEditor
        content={value}
        onUpdate={({ editor }) => onChange(editor.getHTML())}
      />
    </div>
  );
}
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const TextEditor = dynamic(
  () =>
    import("@/components/tiptap-templates/simple/simple-editor").then(
      (mod) => mod.SimpleEditor
    ),
  { ssr: false }
);

export default function EventDescriptionEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    const current = editor.getHTML();

    if (value && value !== current) {
      editor.commands.setContent(value);
    }
  }, [value]);

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="h-[300px] overflow-y-auto scroll-smooth">
        <TextEditor
          content={value}
          onCreate={({ editor }) => {
            editorRef.current = editor;
          }}
          onUpdate={({ editor }) => onChange(editor.getHTML())}
        />
      </div>
      
    </div>
  );
}
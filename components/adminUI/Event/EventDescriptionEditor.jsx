"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";

import ImageUpload from "./ImageUpload";
 
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
} from "lucide-react";

export default function EventDescriptionEditor({ value, onChange }) {
  const [showImageUpload, setShowImageUpload] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      ListItem,
      Placeholder.configure({
        placeholder: "Tulis deskripsi event seperti artikel...",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "min-h-[300px]",
          "p-4",
          "prose max-w-none",
          "prose-h2:text-2xl prose-h3:text-xl",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:list-decimal prose-ol:pl-6",
          "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800",
          "prose-img:rounded-lg prose-img:mx-auto prose-img:my-4",
          "text-black",
          "focus:outline-none",
        ].join(" "),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    // saat EDIT event (load dari DB)
    if (value && value !== currentHTML) {
      editor.commands.setContent(value, false);
    }

    // saat value dikosongkan
    if (!value && currentHTML !== "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  if (!editor) return null;
 
  /* ===== LINK ===== */
  const addLink = () => {
    const url = window.prompt("Masukkan URL");
    if (!url) return;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  /* ===== IMAGE (PAKAI ImageUpload) ===== */
  const handleImageUploaded = (url) => {
    if (!url) return;

    editor.chain().focus().setImage({ src: url }).run();
    setShowImageUpload(false);
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-100 rounded-t-xl">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={16} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={addLink} active={editor.isActive("link")}>
          <Link2 size={16} />
        </ToolbarBtn>

        <ToolbarBtn onClick={() => setShowImageUpload((v) => !v)}>
          <ImageIcon size={16} />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />

      {/* IMAGE UPLOAD AREA */}
      {showImageUpload && (
        <div className="border-t p-4 bg-gray-50">
          <ImageUpload value="" onChange={handleImageUploaded} />
        </div>
      )}
    </div>
  );
}

/* ===================== */

function ToolbarBtn({ children, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-center",
        "w-9 h-9",
        "rounded-md",
        "text-black",
        "hover:bg-gray-200",
        "transition",
        active ? "bg-gray-300" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

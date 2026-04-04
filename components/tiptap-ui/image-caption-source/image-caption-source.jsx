"use client";

import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import ImageIcon from "@mui/icons-material/Image";

export default function ImageCaptionSource() {
  const { editor } = useContext(EditorContext);

  const [imagePos, setImagePos] = useState(null);
  const [caption, setCaption] = useState("");
  const [source, setSource] = useState("");

  if (!editor) return null;

  // ================= DETECT IMAGE SELECTION =================
  useEffect(() => {
    const updateSelection = () => {
      const { selection } = editor.state;

      if (
        selection instanceof NodeSelection &&
        selection.node.type.name === "customImage"
      ) {
        const pos = selection.from;

        setImagePos((prev) => {
          if (prev === pos) return prev;
          return pos;
        });

        const node = editor.state.doc.nodeAt(pos);
        if (node) {
          setCaption(node.attrs.caption || "");
          setSource(node.attrs.source || "");
        }
      } else {
        setImagePos(null);
      }
    };

    editor.on("selectionUpdate", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor]);

  if (imagePos === null) return null;

  const node = editor.state.doc.nodeAt(imagePos);
  if (!node || node.type.name !== "customImage") return null;

  const attrs = node.attrs;

  // ================= UPDATE NODE =================
  const updateNode = (newAttrs) => {
    editor
      .chain()
      .command(({ tr }) => {
        tr.setNodeMarkup(imagePos, undefined, {
          ...attrs,
          ...newAttrs,
        });
        return true;
      })
      .run();
  };

  return (
    <div className="mt-4 border rounded-xl bg-white shadow-sm p-4 space-y-4">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 text-gray-700 font-semibold">
        <ImageIcon fontSize="small" className="text-pink-500" />
        Pengaturan Gambar
      </div>

      {/* ================= CAPTION ================= */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">
          Caption Gambar
        </label>

        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          placeholder="Contoh: Ilustrasi Gambar Wayang"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => updateNode({ caption })}
        />

        <p className="text-xs text-gray-400">
          Caption akan tampil di bawah gambar
        </p>
      </div>

      {/* ================= SOURCE ================= */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">
          Sumber Gambar
        </label>

        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          placeholder="Contoh: Dokumentasi Pribadi"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          onBlur={() => updateNode({ source })}
        />

        <p className="text-xs text-gray-400">
          Akan tampil sebagai: <i>Sumber: ...</i>
        </p>
      </div>

    </div>
  );
}
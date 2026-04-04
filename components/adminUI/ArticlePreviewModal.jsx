"use client";

import TiptapRenderer from "@/components/tiptap/TiptapRenderer";
import { Person } from "@mui/icons-material";

export default function ArticlePreviewModal({ open, onClose, data }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-start overflow-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl p-6 my-10 relative">
        
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>

        {/* CATEGORY */}
        {data.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {data.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1 text-xs border border-pink-400 text-pink-500 rounded-full"
              >
                {cat.title}
              </span>
            ))}
          </div>
        )}

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-4">{data.title}</h1>

        {/* META */}
        <div className="flex items-center gap-3 text-sm mb-6">
          <Person fontSize="small" />
          <span>{data.authorName}</span>

          {data.publishedAt && (
            <>
              <span>|</span>
              <time>
                {new Date(data.publishedAt).toLocaleDateString("id-ID")}
              </time>
            </>
          )}
        </div>

        {/* IMAGE */}
        {data.featuredImage && (
          <img
            src={data.featuredImage}
            className="rounded-xl mb-6 w-full"
          />
        )}

        {/* CONTENT */}
        <TiptapRenderer content={data.content} />

        {/* EDITOR */}
        {data.editorName && (
          <div className="mt-10 bg-gray-100 rounded-xl p-4">
            Editor: {data.editorName}
          </div>
        )}

        {/* TAGS */}
        {data.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {data.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gray-200 rounded-full text-xs"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
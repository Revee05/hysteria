"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ArticlePreviewModal({ open, onClose, data }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-black"
        >
          Close ✕
        </button>

        {/* Featured Image */}
        {data.featuredImagePreview && (
          <img
            src={data.featuredImagePreview}
            className="w-full h-72 object-cover rounded-xl mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>

        {/* Meta */}
        <div className="text-sm text-gray-500 mb-6">
          <span>By {data.authorName}</span>
          {data.publishedAt && (
            <span> • {new Date(data.publishedAt).toDateString()}</span>
          )}
        </div>

        {/* Excerpt */}
        {data.excerpt && (
          <p className="text-lg text-gray-600 mb-6">{data.excerpt}</p>
        )}

        {/* Content */}
        <div className="prose max-w-none">
          {/* kalau pakai tiptap JSON */}
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.content, null, 2)}
          </pre>
        </div>

        {/* Tags */}
        {data.tagNames?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {data.tagNames.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

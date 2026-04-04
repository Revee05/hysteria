"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Person, Instagram, Facebook, X as XIcon } from "@mui/icons-material";
import TiptapRenderer from "@/components/tiptap/TiptapRenderer";

export default function ArticlePreviewModal({ open, onClose, data }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const categories = data.categories ?? [];
  const tags = data.tags ?? [];
  const references = data.references ?? [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const articleUrl = `${siteUrl}/artikel/${data.slug || "preview"}`;

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">

      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[1000] bg-white px-5 py-2 rounded-lg shadow text-sm font-medium hover:bg-gray-100"
      >
        Close ✕
      </button>

      {/* ================= LAYOUT IDENTIK ================= */}
      <div className="bg-[var(--background)] text-[var(--foreground)] pt-12">

        <article className="max-w-6xl mx-auto px-6 py-20">

          {/* CATEGORY */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <span
                  key={cat.id || cat}
                  className="px-3 py-1 text-xs border border-pink-400 text-pink-500 rounded-full"
                >
                  {cat.title || cat}
                </span>
              ))}
            </div>
          )}

          {/* TITLE */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {data.title || "Judul Artikel"}
          </h1>

          {/* META */}
          <div className="flex items-center gap-4 text-sm mb-8">

            <div className="flex items-center gap-2">
              <Person style={{ fontSize: 18 }} className="text-pink-500" />
              <span>{data.authorName || "Author"}</span>
            </div>

            {data.publishedAt && (
              <>
                <span>|</span>
                <time dateTime={data.publishedAt}>
                  {new Date(data.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </>
            )}
          </div>

          {/* FEATURED IMAGE + CONTENT CONTAINER */}
          <div className="w-5/6 mx-auto">

            {/* FEATURED IMAGE */}
            {data.featuredImage && (
              <>
                <img
                  src={data.featuredImage}
                  alt={data.title}
                  className="rounded-xl mb-2 w-full object-cover"
                />

                {data.featuredImageSource && (
                  <p className="text-sm text-pink-500 text-center mb-8">
                    Sumber: {data.featuredImageSource}
                  </p>
                )}
              </>
            )}

            {/* CONTENT */}
            <TiptapRenderer content={data.content} />

            {/* REFERENCES */}
            {references.length > 0 && (
              <div className="mt-14 flex flex-wrap items-center text-sm leading-relaxed">
                <span className="font-semibold mr-2 text-pink-500">
                  Referensi Artikel :
                </span>

                {references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:underline mr-2"
                  >
                    {ref.title}
                    {index < references.length - 1 && ","}
                  </a>
                ))}
              </div>
            )}

            {/* EDITOR */}
            {data.editorName && (
              <div className="mt-7 bg-gray-200/60 rounded-2xl px-6 py-4">
                <span className="font-semibold text-gray-700">Editor:</span>{" "}
                <span className="text-gray-600">{data.editorName}</span>
              </div>
            )}

            {/* PREVIEW MODE */}
            <div className="mt-7 flex justify-start">
              <div className="px-6 py-2 rounded-full bg-pink-50 text-pink-500 text-xs font-medium">
                👁 Preview Mode
              </div>
            </div>

            {/* TAGS + SHARE */}
            <div className="mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">

              {/* TAGS */}
              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Tags</h3>

                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => (
                      <span
                        key={tag.id || tag}
                        className="px-4 py-2 text-xs bg-gray-100 rounded-full"
                      >
                        #{tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SHARE */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Share</h3>

                <div className="flex gap-2 text-gray-600">

                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <Instagram fontSize="large" />
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <Facebook fontSize="large" />
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${articleUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <XIcon fontSize="large" />
                  </a>

                </div>
              </div>

            </div>

          </div>
        </article>
      </div>
    </div>,
    document.body
  );
}
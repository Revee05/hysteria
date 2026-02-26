"use client";

import Link from "next/link";
import { Person } from "@mui/icons-material";

export default function ArticleCard({ article, variant = "small" }) {
  const preview =
    article.excerpt && article.excerpt.trim() !== ""
      ? article.excerpt
      : article.content?.replace(/<[^>]+>/g, "").slice(0, 140);

  const categories = article.categories || [];

  return (
    <Link href={`/artikel/${article.slug}`}>
      <div
        className={`group relative rounded-2xl overflow-hidden 
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:shadow-2xl
        shadow-md cursor-pointer h-full
        ${variant === "large" ? "bg-black" : "bg-white"}
        `}
      >
        {/* ================= IMAGE ================= */}
        <div
          className={`relative overflow-hidden ${
            variant === "large" ? "h-full min-h-[260px]" : "h-40"
          }`}
        >
          <img
            src={article.featuredImage || "/placeholder.jpg"}
            alt={article.title}
            className={`w-full h-full object-cover transition-all duration-700
              ${variant === "large" ? "group-hover:scale-110 group-hover:blur-[1px]" : "group-hover:scale-110"}
            `}
          />

          {/* ================= LARGE HOVER OVERLAY ================= */}
          {variant === "large" && (
            <div
              className="absolute inset-0 flex flex-col justify-end p-6
              bg-black/50 opacity-0
              group-hover:opacity-100
              transition-all duration-500"
            >
              <div className="translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out">

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((cat) => (
                    <span
                      key={cat.category.id}
                      className="px-3 py-1 text-xs bg-pink-500 text-white rounded-full backdrop-blur-sm"
                    >
                      {cat.category.title}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-white text-2xl font-bold line-clamp-2">
                  {article.title}
                </h2>

                {/* Preview */}
                <p className="text-white/80 text-sm mt-2 line-clamp-2">
                  {preview}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-white/90 mt-4">
                  <div className="flex items-center gap-1">
                    <Person style={{ fontSize: 16 }} />
                    <span>{article.authorName}</span>
                  </div>

                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SMALL CARD ================= */}
        {variant === "small" && (
          <div className="p-4 flex flex-col flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <span
                    key={cat.category.id}
                    className="px-3 py-1 text-xs border border-pink-400 text-pink-500 rounded-full"
                  >
                    {cat.category.title}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 text-xs border border-gray-300 text-gray-400 rounded-full">
                  Tanpa Kategori
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold leading-snug line-clamp-2">
              {article.title}
            </h2>

            <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">
              {preview}
            </p>

            <span className="mt-2 font-semibold underline text-xs">
              Baca Selengkapnya
            </span>

            <div className="flex justify-between items-center text-xs text-pink-500 mt-4">
              <div className="flex items-center gap-1">
                <Person style={{ fontSize: 16 }} />
                <span>{article.authorName}</span>
              </div>

              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

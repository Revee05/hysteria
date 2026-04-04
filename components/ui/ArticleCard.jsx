"use client";

import Link from "next/link";
import Image from "next/image";
import { Person } from "@mui/icons-material";
import { extractTextFromTiptap } from "@/lib/utils/extractTiptapText";

export default function ArticleCard({ article, variant = "small" }) {
  const preview =
    article.excerpt?.trim() ||
    extractTextFromTiptap(article.content || {}).slice(0, 140);

  const categories = article.categories || [];

  return (
    <Link href={`/artikel/${article.slug}`}>
      <div
        className={`group relative rounded-2xl overflow-hidden 
        transition-all duration-300 ease-out will-change-transform
        hover:-translate-y-1 md:hover:-translate-y-2 
        hover:shadow-xl md:hover:shadow-2xl
        shadow-sm md:shadow-md cursor-pointer
        ${
          variant === "large"
            ? "bg-black h-[260px] md:h-[320px] lg:h-[380px]"
            : "bg-white h-full"
        }`}
      >

        {/* ================= IMAGE ================= */}
        <div
          className={`relative overflow-hidden ${
            variant === "large"
              ? "h-full min-h-[200px] md:min-h-[240px] lg:min-h-[260px]"
              : "h-32 sm:h-36 md:h-40"
          }`}
        >
          <Image
            src={article.featuredImage || "/placeholder.jpg"}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700
            ${
              variant === "large"
                ? "group-hover:scale-110 group-hover:blur-[1px]"
                : "group-hover:scale-110"
            }`}
          />

          {/* ================= LARGE CARD OVERLAY ================= */}
          {variant === "large" && (
            <div
              className="absolute inset-0 flex flex-col justify-end 
              p-3 md:p-4 lg:p-6
              bg-black/50 opacity-0
              group-hover:opacity-100
              transition-all duration-500"
            >
              <div className="translate-y-4 md:translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out">

                {/* CATEGORY */}
                <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2 md:px-3 py-1 text-[10px] md:text-xs bg-pink-500 text-white rounded-full"
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>

                {/* TITLE */}
                <h2 className="text-sm md:text-lg lg:text-2xl font-bold text-white line-clamp-2">
                  {article.title}
                </h2>

                {/* DESC */}
                <p className="text-[11px] md:text-sm text-white/80 mt-1 md:mt-2 line-clamp-2">
                  {preview}
                </p>

                {/* FOOTER */}
                <div className="flex justify-between items-center text-[10px] md:text-xs text-white/90 mt-2 md:mt-4">
                  <div className="flex items-center gap-1">
                    <Person style={{ fontSize: 14 }} />
                    <span>{article.authorName}</span>
                  </div>

                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
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
          <div className="p-3 md:p-4 flex flex-col flex-1">

            {/* CATEGORY */}
            <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 md:px-3 py-1 text-[10px] md:text-xs border border-pink-400 text-pink-500 rounded-full"
                  >
                    {cat.title}
                  </span>
                ))
              ) : (
                <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs border border-gray-300 text-gray-400 rounded-full">
                  Tanpa Kategori
                </span>
              )}
            </div>

            {/* TITLE */}
            <h2 className="text-sm md:text-base lg:text-lg font-bold leading-snug line-clamp-2">
              {article.title}
            </h2>

            {/* DESC */}
            <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 line-clamp-2 flex-1">
              {preview}
            </p>

            {/* READ MORE */}
            <span className="mt-2 font-semibold underline text-[10px] md:text-xs">
              Baca Selengkapnya
            </span>

            {/* FOOTER */}
            <div className="flex justify-between items-center text-[10px] md:text-xs text-pink-500 mt-3 md:mt-4">
              <div className="flex items-center gap-1">
                <Person style={{ fontSize: 14 }} />
                <span>{article.authorName}</span>
              </div>

              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : ""}
              </span>
            </div>

          </div>
        )}
      </div>
    </Link>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Helper function to format dates to Indonesian locale
 * @param {string|Date} date - The date to be formatted
 * @returns {string} Formatted date string (e.g., "31 Maret 2026")
 */
const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

/**
 * ArtikelHysteria Component
 *
 * Displays the latest 3 articles from the database in a premium 1+2 grid layout.
 * Featured article on the left (spanning 2 columns on md+) and two smaller articles on the right.
 *
 * Features:
 * - Responsive design (Stacked on mobile, Grid on md/lg)
 * - Glassmorphism category badges (pill style with backdrop blur)
 * - Dynamic data fetching from Prisma
 * - Detailed article info (Title, Excerpt, Author, Date, Category)
 */
export default function ArtikelHysteria({ initialArticles = [] }) {
  // Extract only the top 3 latest articles
  const articles = initialArticles.slice(0, 3);

  // If no articles are available, hide the entire section
  if (articles.length === 0) return null;

  // Distribute articles: 1 Featured, up to 2 for the Sidebar
  const featured = articles[0];
  const sidebarItems = articles.slice(1, 3);

  return (
    // article section
    <section
      aria-labelledby="artikel-hysteria-heading"
      className="py-12 px-4 sm:px-6 lg:px-28 mb-20 bg-white"
    >
      {/* row atas */}
      <div className="w-full max-w-[1920px] mx-auto">
        <header className="flex justify-between items-end mb-8">
          <h2
            id="artikel-hysteria-heading"
            className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight"
          >
            Artikel di Hysteria
          </h2>
          <Link
            href="/artikel"
            className="text-sm sm:text-base font-bold text-gray-900 hover:text-pink-600 transition-colors underline-offset-4 underline decoration-2 decoration-zinc-300 hover:decoration-pink-500"
          >
            Lihat Semua
          </Link>
        </header>

        {/* Dynamic Grid: 1 column on mobile, 3 columns on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* --- MAIN FEATURED ARTICLE (LEFT) --- */}
          <div className="md:col-span-2">
            <article className="relative group rounded-2xl overflow-hidden shadow-2xl h-[350px] sm:h-[450px] md:h-[500px] flex flex-col justify-end">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                className="object-cover"
                priority
              />
              {/* Overlay: Permanent gradient/blur for text readability */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1/2px]" />

              {/* Category Badge: Pill style with Glassmorphism & border accent */}
              {featured.categories?.[0] && (
                <div className="absolute left-0 top-6 sm:top-8 px-4 py-1.5 bg-white/70 backdrop-blur-md border-l-4 border-pink-600 rounded-r-full shadow-xl z-20">
                  <span className="text-[10px] md:text-xs font-black text-zinc-900 uppercase tracking-wider">
                    {featured.categories[0].title}
                  </span>
                </div>
              )}

              <figcaption className="relative z-10 p-3 md:p-5 w-full">
                <h3 className="text-xl md:text-3xl font-bold text-white mb-3 leading-tight drop-shadow-md">
                  <Link
                    href={`/artikel/${featured.slug}`}
                    className="hover:underline"
                  >
                    {featured.title}
                  </Link>
                </h3>

                <p className="text-white/90 text-xs md:text-sm mb-4 line-clamp-2 drop-shadow-sm max-w-2xl">
                  {featured.excerpt}
                </p>

                <Link
                  href={`/artikel/${featured.slug}`}
                  className="inline-block text-white text-xs md:text-sm font-bold underline underline-offset-4 hover:text-pink-300 transition-colors mb-6"
                >
                  Baca Selengkapnya
                </Link>

                <div className="flex items-center justify-between text-white/90 border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/20 flex items-center justify-center rounded-full">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] md:text-xs font-medium">
                      {featured.authorName}
                    </span>
                  </div>
                  <time className="text-[10px] md:text-xs font-medium">
                    {formatDate(featured.publishedAt || featured.createdAt)}
                  </time>
                </div>
              </figcaption>
            </article>
          </div>

          {/* --- SIDEBAR ARTICLES (RIGHT) --- */}
          <div className="flex flex-col gap-6 md:gap-8 lg:justify-between">
            {sidebarItems.map((article) => (
              <article
                key={article.id}
                className="relative group rounded-2xl overflow-hidden shadow-xl h-[220px] sm:h-[220px] md:h-[235px] flex flex-col justify-end"
              >
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                />

                {/* Overlay for sidebar readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1/2px]" />

                {/* Sidebar Category Badge (Consistent style) */}
                {article.categories?.[0] && (
                  <div className="absolute left-0 top-4 px-3 py-1 bg-white/70 backdrop-blur-md border-l-4 border-pink-600 rounded-r-full shadow-lg z-20">
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-900 uppercase tracking-wider">
                      {article.categories[0].title}
                    </span>
                  </div>
                )}

                <figcaption className="relative z-10 p-2 md:p-3 w-full">
                  <h4 className="text-sm md:text-lg font-bold text-white leading-tight mb-3 line-clamp-2 drop-shadow-sm">
                    <Link
                      href={`/artikel/${article.slug}`}
                      className="hover:underline"
                    >
                      {article.title}
                    </Link>
                  </h4>

                  <div className="flex items-center justify-between text-white/90 border-t border-white/20 pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-white/20 flex items-center justify-center rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-[9px] md:text-[11px] font-medium truncate max-w-[80px] sm:max-w-none">
                        {article.authorName}
                      </span>
                    </div>
                    <time className="text-[9px] md:text-[11px] font-medium shrink-0">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </time>
                  </div>
                </figcaption>
              </article>
            ))}

            {/* Fallback if only 1 or 2 articles */}
            {sidebarItems.length === 0 && (
              <div className="h-full bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 text-sm italic">
                Lainnya segera hadir
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

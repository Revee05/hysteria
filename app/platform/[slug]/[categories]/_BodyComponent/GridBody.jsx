"use client";

import { useState, useMemo } from "react";
import PosterCard from "./cards/PosterCard";

/**
 * GridBody — layout "grid"
 *
 * Renders:
 *  - Search input
 *  - Filter tag buttons (optional)
 *  - Responsive card grid (Tailwind-based cards)
 *  - Pagination
 *
 * Props:
 *   items   : Array<{ src, alt?, title, subtitle?, tag? }>
 *   filters : string[]  (unique tag labels for filtering)
 */

const ITEMS_PER_PAGE = 15; // 5 kolom × 3 baris

export default function GridBody({ items = [], filters = [] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  /* ---------- filtering + search ---------- */
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by tag
    if (activeFilter !== "Semua") {
      result = result.filter((item) => item.tag === activeFilter);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.subtitle || "").toLowerCase().includes(q) ||
          (item.tag || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, activeFilter, search]);

  /* ---------- pagination ---------- */
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filter/search changes
  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setPage(1);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const allFilters = ["Semua", ...filters];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-24 py-10">
      {/* Search bar */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-5 pr-12 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
          {/* Search icon */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        </div>

        {/* Action icons */}
        <button className="flex-none w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition" aria-label="QR Code">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button className="flex-none w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition" aria-label="Settings">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </button>
      </div>

      {/* Filter tags */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {allFilters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid — Tailwind-based cards */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
          {paginatedItems.map((item, i) => (
            <PosterCard
              key={i}
              src={item.src}
              alt={item.alt}
              title={item.title}
              subtitle={item.subtitle}
              badge={item.badge}
              meta={item.meta}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400">
          <p>Tidak ada item yang ditemukan.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                page === i + 1
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow"
                  : "text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition"
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

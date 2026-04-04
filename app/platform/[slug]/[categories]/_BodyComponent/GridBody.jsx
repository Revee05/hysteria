"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "../../../../../hooks/use-debounce";
import PosterCard from "./cards/PosterCard";
import MockUpPosterCard from "./cards/MockUpPosterCard";
import KomikRamuanCard from "./cards/KomikRamuanCard";
import VideoCard from "./cards/VideoCard";
import Tooltip from "@mui/material/Tooltip";
import SortMenu from "@/components/ui/SortMenu";
import Pagination from "@/components/ui/Pagination";

const DEFAULT_ITEMS_PER_PAGE = 10; // default: 5 kolom × 2 baris

const STATUS_OPTIONS = [
  { label: "Semua", style: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" },
  {
    label: "Akan Berlangsung",
    style: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    label: "Sedang Berlangsung",
    style: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    label: "Telah Berakhir",
    style: "bg-zinc-200 text-zinc-500 hover:bg-zinc-300",
  },
];

export default function GridBody({
  items = [],
  filters = [],
  cardType = "poster",
  showFilterIcon = true,
  showStatusFilter = false,
  itemsPerPageOverride = undefined,
  gridCols = undefined,
}) {
  const resolvedItems = items;
  const resolvedFilters = filters;
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState("terbaru");
  const [activeStatus, setActiveStatus] = useState("Semua");
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [cursor, setCursor] = useState(0);

  const toggleFilters = () => setShowFilters((s) => !s);
  const toggleStatusPanel = () => setShowStatusPanel((s) => !s);

  /* ---------- filtering + search ---------- */
  const parseMetaDate = (meta) => {
    if (!meta) return null;
    if (meta instanceof Date) return meta.getTime();
    // try native parse first
    const native = Date.parse(meta);
    if (!Number.isNaN(native)) return native;
    // try to parse Indonesian-ish format like "Sabtu, 14 Maret 2026" or "14 Maret 2026"
    const months = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    };
    const m = String(meta).match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
    if (m) {
      const day = parseInt(m[1], 10);
      const monName = m[2];
      const year = parseInt(m[3], 10);
      const month = months[monName];
      if (typeof month === "number")
        return new Date(year, month, day).getTime();
    }
    return null;
  };
  const debouncedSearch = useDebounce(search);

  const filteredItems = useMemo(() => {
    let result = resolvedItems;

    // Normalize string to slug format for loose matching (e.g. "Having Fun Artlab" → "having-fun-artlab")
    const toSlug = (s) => (s || "").toLowerCase().replace(/\s+/g, "-");

    // Filter by tag — check sub-category slug(s) first, then tag names (with slug normalization)
    if (activeFilter !== "Semua") {
      result = result.filter(
        (item) =>
          item.tag === activeFilter ||
          (Array.isArray(item.tagSlugs) &&
            item.tagSlugs.includes(activeFilter)) ||
          (Array.isArray(item.tags) &&
            item.tags.some(
              (t) => t === activeFilter || toSlug(t) === activeFilter,
            )),
      );
    }

    // Filter by event status (badge)
    if (activeStatus !== "Semua") {
      result = result.filter((item) => item.badge === activeStatus);
    }

    // Filter by search (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.subtitle || "").toLowerCase().includes(q) ||
          (Array.isArray(item.tags) ? item.tags.join(" ") : item.tag || "")
            .toLowerCase()
            .includes(q),
      );
    }

    // Apply sorting
    const sorted = [...result];
    const getTs = (it) => parseMetaDate(it.meta);

    if (sortMode === "terbaru") {
      sorted.sort((a, b) => {
        const ta = getTs(a);
        const tb = getTs(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return tb - ta;
      });
    } else if (sortMode === "terlama") {
      sorted.sort((a, b) => {
        const ta = getTs(a);
        const tb = getTs(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return ta - tb;
      });
    } else if (sortMode === "a-z") {
      sorted.sort((a, b) =>
        ("" + (a.title || "")).localeCompare("" + (b.title || "")),
      );
    } else if (sortMode === "z-a") {
      sorted.sort((a, b) =>
        ("" + (b.title || "")).localeCompare("" + (a.title || "")),
      );
    }

    return sorted;
  }, [resolvedItems, activeFilter, activeStatus, debouncedSearch, sortMode]);

  /* ---------- pagination ---------- */
  const isKomikRamuan = cardType === "komik-ramuan";
  const isMockupLayout =
    isKomikRamuan ||
    resolvedItems.some(
      (item) => item.meta === "mockup" || item.meta === "video",
    );
  const itemsPerPage = isMockupLayout
    ? 8
    : (itemsPerPageOverride ?? DEFAULT_ITEMS_PER_PAGE);

  const paginatedItems = filteredItems.slice(cursor, cursor + itemsPerPage);
  const hasPrev = cursor > 0;
  const hasNext = cursor + itemsPerPage < filteredItems.length;
  const currentStart = filteredItems.length === 0 ? 0 : cursor + 1;
  const currentEnd = Math.min(cursor + itemsPerPage, filteredItems.length);

  // Reset cursor when filter/search changes
  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setCursor(0);
  };
  const handleStatusChange = (s) => {
    setActiveStatus(s);
    setCursor(0);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCursor(0);
  };

  const allFilters = ["Semua", ...resolvedFilters];

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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        </div>

        {/* Action icons filter tag (hidden for mockup layout and when explicitly disabled) */}
        {!isMockupLayout && showFilterIcon && (
          <Tooltip title="Filter Tag" arrow>
            <button
              className="flex-none w-10 h-10 border border-zinc-300 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition cursor-pointer"
              aria-label="Toggle filter tags"
              aria-expanded={showFilters}
              aria-controls="filter-tags"
              onClick={toggleFilters}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </Tooltip>
        )}
        {/* Toggle button for status filter */}
        {showStatusFilter && (
          <Tooltip title="Filter Status" arrow>
            <button
              className="flex-none w-10 h-10 border border-zinc-300 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition cursor-pointer"
              aria-label="Toggle filter status"
              aria-expanded={showStatusPanel}
              aria-controls="filter-status"
              onClick={toggleStatusPanel}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 15m0 0l3.75 3.75M17.25 15l3.75-3.75M17.25 15H9"
                />
              </svg>
            </button>
          </Tooltip>
        )}
        {/* shared sort menu component (icon-only control) */}
        <SortMenu
          value={sortMode}
          onChange={(m) => {
            setSortMode(m);
            setCursor(0);
          }}
          className="flex-none"
        />
      </div>

      {/* Filter (hidden for mockup layout) */}
      {resolvedFilters.length > 0 && !isMockupLayout && (
        <div
          id="filter-tags"
          className={`${showFilters ? "block" : "hidden"} flex flex-wrap gap-2 justify-center mb-8`}
        >
          {allFilters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-linear-to-r from-pink-500 to-orange-400 text-white shadow cursor-pointer"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Status filter */}
      {showStatusFilter && (
        <div
          id="filter-status"
          className={`${showStatusPanel ? "flex" : "hidden"} flex-wrap gap-2 justify-center mb-8`}
        >
          {STATUS_OPTIONS.map(({ label, style }) => (
            <button
              key={label}
              onClick={() => handleStatusChange(label)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeStatus === label
                  ? "bg-linear-to-r from-pink-500 to-orange-400 text-white shadow"
                  : style
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Grid — Tailwind-based cards */}
      {paginatedItems.length > 0 ? (
        <div
          className={`grid gap-5 ${isMockupLayout ? "grid-cols-2 md:grid-cols-4" : `grid-cols-2 md:grid-cols-${gridCols ?? 5}`}`}
        >
          {paginatedItems.map((item, i) => (
            <LazyItem key={i}>
              {isKomikRamuan ? (
                <KomikRamuanCard
                  id={item.id}
                  imageUrl={item.imageUrl || item.src || item.thumbnail}
                  alt={item.alt}
                  year={item.year || item.meta || item.date}
                  title={item.title}
                  prevdescription={item.prevdescription}
                  href={item.href || item.url}
                  buttonLabel={item.buttonLabel}
                />
              ) : item.meta === "mockup" ? (
                // ini untuk mockup view
                <MockUpPosterCard
                  id={item.id}
                  imageUrl={item.imageUrl}
                  alt={item.alt}
                  year={item.year}
                  title={item.title}
                  prevdescription={item.prevdescription}
                  href={item.href || item.url}
                  buttonLabel={item.buttonLabel}
                />
              ) : item.meta === "video" ? (
                // ini untuk homecooked view
                <VideoCard
                  id={item.id}
                  imageUrl={item.imageUrl || item.src}
                  youtube={item.youtube}
                  url={item.url}
                  alt={item.alt}
                  title={item.title}
                  prevdescription={item.prevdescription}
                  host={item.host}
                  guests={item.guests}
                />
              ) : (
                <PosterCard
                  id={item.id}
                  imageUrl={item.imageUrl || item.src}
                  alt={item.alt}
                  title={item.title}
                  description={item.description}
                  badge={item.badge}
                  tags={item.tags}
                  meta={item.meta || item.year}
                  slug={item.slug}
                />
              )}
            </LazyItem>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400">
          <p>Tidak ada item yang ditemukan.</p>
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <Pagination
          currentPage={Math.floor(cursor / itemsPerPage) + 1}
          totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
          onPageChange={(page) => setCursor((page - 1) * itemsPerPage)}
          className="mt-7"
        />
      )}
    </div>
  );
}

function LazyItem({ children, rootMargin = "200px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <div
      ref={ref}
      style={{ minHeight: 1 }}
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {visible ? children : null}
    </div>
  );
}

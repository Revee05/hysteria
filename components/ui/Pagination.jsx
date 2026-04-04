import React, { useMemo } from "react";

/**
 * Pagination component
 * Props:
 * - totalPages: number (required)
 * - currentPage: number (required)
 * - onPageChange: function(page:number) (required)
 * - jumpStep: number (optional, default 5)
 * - maxVisible: number (optional, default 9) - when totalPages <= maxVisible shows all pages
 * - className: string (optional)
 * - ariaLabelPrefix: string (optional)
 */
export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  maxVisible = 5,
  className = "",
  ariaLabelPrefix = "Page",
}) {
  const pages = useMemo(() => {
    if (totalPages <= maxVisible)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const delta = 1; // siblings around current
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    const out = [1];
    if (left > 2) out.push("left-ellipsis");
    for (let i = left; i <= right; i++) out.push(i);
    if (right < totalPages - 1) out.push("right-ellipsis");
    out.push(totalPages);
    return out;
  }, [totalPages, currentPage, maxVisible]);

  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-[#ec3f94] px-4 py-2 text-white shadow-md">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={handlePrev}
          className="flex h-auto w-auto items-center justify-center rounded-full bg-white/30 text-pink-600 transition hover:bg-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-2 px-1">
          {pages.map((p, idx) => {
            if (p === "left-ellipsis" || p === "right-ellipsis") {
              return (
                <span key={`e-${idx}`} className="px-1 font-bold text-white">
                  ...
                </span>
              );
            }

            const active = currentPage === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`flex h-7 w-7 items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                  active
                    ? "rounded-full bg-white/40 text-white shadow-xs scale-110"
                    : "text-white hover:text-pink-200"
                }`}
                aria-label={`${ariaLabelPrefix} ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={handleNext}
          className="flex h-auto w-auto items-center justify-center rounded-full bg-white text-[#ec3f94] transition hover:bg-pink-50 disabled:bg-white/30 disabled:text-pink-600 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

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
  jumpStep = 5,
  maxVisible = 9,
  className = "",
  ariaLabelPrefix = "Page",
}) {
  const pages = useMemo(() => {
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

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
  const handleJumpBack = () => onPageChange(Math.max(1, currentPage - jumpStep));
  const handleJumpForward = () => onPageChange(Math.min(totalPages, currentPage + jumpStep));

  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        disabled={currentPage <= 1}
        onClick={handlePrev}
        className="w-9 h-9 flex items-center justify-center text-pink-500 hover:bg-pink-200 disabled:opacity-30 transition cursor-pointer"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        disabled={currentPage <= 1}
        onClick={handleJumpBack}
        className="w-9 h-9 flex items-center justify-center text-pink-400 hover:bg-pink-200 disabled:opacity-30 transition cursor-pointer"
        aria-label={`Jump back ${jumpStep} pages`}
        title={`Prev ${jumpStep} Pages`}
      >
        <span className="text-3xl">«</span>
      </button>

      {pages.map((p, idx) => {
        if (p === "left-ellipsis" || p === "right-ellipsis") {
          return (
            <span key={`e-${idx}`} className="px-2 text-zinc-400">
              …
            </span>
          );
        }

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 text-sm font-medium transition-colors ${
              currentPage === p
                ? "rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow cursor-pointer"
                : "rounded-full text-zinc-600 hover:bg-pink-200 cursor-pointer"
            }`}
            aria-label={`${ariaLabelPrefix} ${p}`}
          >
            {p}
          </button>
        );
      })}

      <button
        disabled={currentPage >= totalPages}
        onClick={handleJumpForward}
        className="w-9 h-9 flex items-center justify-center text-pink-400 hover:bg-pink-200 disabled:opacity-30 transition cursor-pointer"
        aria-label={`Jump forward ${jumpStep} pages`}
        title={`Next ${jumpStep} Pages`}
      >
        <span className="text-3xl">»</span>
      </button>

      <button
        disabled={currentPage >= totalPages}
        onClick={handleNext}
        className="w-9 h-9 flex items-center justify-center text-pink-500 hover:bg-pink-200 disabled:opacity-30 transition cursor-pointer"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.4 16.4 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProgramSearchBar({
  initialQuery = "",
  onSearch,
  onFilterClick,
  isLoading = false,
}) {
  const [q, setQ] = useState(initialQuery);

  function submit(e) {
    e.preventDefault();
    onSearch?.(q);
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <form
        onSubmit={submit}
        className="relative w-full max-w-3xl"
        aria-label="Search form"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="w-full rounded-full border border-[#ff4aa2] bg-white px-6 py-4 pr-14 text-sm text-[#8a2a78] outline-none placeholder:text-[#ff4aa2]/80 focus:ring-2 focus:ring-[#ff4aa2]/30"
        />

        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#ff4aa2] hover:bg-[#ff4aa2]/10"
          aria-label="Search"
          disabled={isLoading}
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="absolute -bottom-6 left-6 text-xs text-[#8a2a78]/60">
            Loading...
          </div>
        ) : null}
      </form>

      <button
        type="button"
        onClick={onFilterClick}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff4aa2] bg-white text-[#ff4aa2] hover:bg-[#ff4aa2]/10"
        aria-label="Filter"
      >
        <FilterIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

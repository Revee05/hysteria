import React from "react";

export default function Loading() {
  return (
    <div className="bg-white">
      <main className="font-sans w-full max-w-[1920px] mx-auto bg-white min-h-screen">

        {/* ── Hero skeleton ─────────────────────────────────────────────────── */}
        {/* Mirrors: relative w-full h-[500px] md:h-[650px] bg-[#d9d9d9]       */}
        <div className="relative w-full h-[500px] md:h-[650px] bg-gray-200 overflow-hidden animate-pulse">
          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Mirrors: absolute z-10 left-6 md:left-24 top-5/9 w-full md:w-1/2 */}
          <div className="absolute z-10 left-6 md:left-24 top-5/9 w-full md:w-1/2 px-4 md:px-0 space-y-4">
            {/* h1: text-[32px] md:text-[40px] lg:text-[56px] */}
            <div className="h-9 md:h-11 lg:h-14 bg-gray-300/80 rounded-md w-2/3" />
            {/* p: text-[14px] md:text-[18px] lg:text-[20px] max-w-[680px] */}
            <div className="h-4 md:h-5 bg-gray-300/60 rounded w-1/2" />
            <div className="h-4 md:h-5 bg-gray-300/60 rounded w-2/5" />
          </div>
        </div>

        {/* ── Body skeleton (Grid layout — default) ─────────────────────────── */}
        {/* Mirrors: w-full max-w-[1920px] mx-auto px-4 md:px-24 py-10          */}
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-24 py-10">

          {/* Search bar row — mirrors: flex justify-center items-center gap-3 mb-6 */}
          <div className="flex justify-center items-center gap-3 mb-6">
            {/* Input: relative w-full max-w-xl h-[46px] rounded-full */}
            <div className="relative w-full max-w-xl h-[46px] bg-gray-200 rounded-full animate-pulse" />
            {/* QR icon button: w-10 h-10 rounded-full */}
            <div className="flex-none w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            {/* Settings icon button: w-10 h-10 rounded-full */}
            <div className="flex-none w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          </div>

          {/* Filter pills — mirrors: flex flex-wrap gap-2 justify-center mb-8 */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 animate-pulse">
            {[72, 88, 64, 96, 80, 108, 68].map((w, i) => (
              <div
                key={i}
                className="h-9 bg-gray-200 rounded-full"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Card grid — mirrors: grid grid-cols-3 md:grid-cols-5 gap-5 */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-5 animate-pulse">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="space-y-2">
                {/* PosterCard — aspect 2:3 */}
                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
              </div>
            ))}
          </div>

          {/* Pagination — mirrors: flex justify-center items-center gap-2 mt-10  */}
          {/* prev arrow + 3 page buttons + next arrow (w-9 h-9 rounded-full each) */}
          <div className="flex justify-center items-center gap-2 mt-10 animate-pulse">
            {/* prev arrow */}
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            {/* page number buttons */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full ${i === 0 ? "bg-gray-300" : "bg-gray-200"}`}
              />
            ))}
            {/* next arrow */}
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>

        </div>

      </main>
    </div>
  );
}

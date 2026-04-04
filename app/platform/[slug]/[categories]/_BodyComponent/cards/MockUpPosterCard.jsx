"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useViewTracker } from "@/hooks/use-view-tracker";

/**
 * MockUpPosterCard — kartu vertikal dengan gambar, tahun+judul, deskripsi, dan tombol CTA
 *
 * Props:
 *   imageUrl    : string   — URL gambar (fallback ke DummyPoster)
 *   alt         : string   — alt text gambar
 *   year        : string   — tahun (e.g. "2024"), digabung dengan title: "2024 – Title"
 *   title       : string   — judul konten
 *   prevdescription : string   — deskripsi singkat
 *   href        : string   — link tombol CTA (opsional)
 *   buttonLabel : string   — label tombol (default: "Lihat File")
 */
export default function MockUpPosterCard({
  id,
  imageUrl,
  alt,
  year,
  title,
  prevdescription,
  // description,
  href,
  buttonLabel = "Lihat",
}) {
  const { trackView } = useViewTracker();

  const handleTrackClick = useCallback(() => {
    if (id) trackView(id);
  }, [id, trackView]);
  const imgSrc = imageUrl || "/image/DummyPoster.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");
  const fullTitle = year && title ? `${year} - ${title}` : title || year || "";

  return (
    <div className="w-full md:max-w-[380px] md:aspect-3/4 flex flex-col overflow-hidden rounded-xl bg-white border-2 border-zinc-300 drop-shadow-lg hover:shadow-2xl transition hover:translate-y-[-8px] cursor-pointer">
      {/* Image */}
      <div className="relative w-full aspect-video shrink-0 bg-zinc-300">
        <Image
          src={imgSrc}
          alt={alt || fullTitle || "Poster"}
          fill
          loading="lazy"
          unoptimized={!isLocal}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 px-3 py-2 md:py-3 flex-1">
        {fullTitle && (
          <h3 className="text-zinc-900 text-[11px] md:text-[14px] font-bold leading-[14px] md:leading-[18px] line-clamp-2 shrink">
            {fullTitle}
          </h3>
        )}
        {prevdescription && (
          <p className="text-zinc-600 text-[10px] md:text-[12px] leading-[14px] md:leading-[18px] line-clamp-4 mb-1.5 md:mb-2">
            {prevdescription}
          </p>
        )}

        {/* CTA Button */}
        <div className="mt-auto">
          {href ? (
            <Link
              href={href}
              onClick={handleTrackClick}
              className="block rounded-lg bg-[#43334C] py-1 text-center text-sm font-semibold text-white transition-colors hover:bg-transparent hover:text-[#43334C] hover:border-2 border-[#43334C] md:mb-1"
            >
              {buttonLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleTrackClick}
              className="block w-full rounded-lg bg-[#43334C] py-1 text-sm font-semibold text-white transition-colors hover:bg-transparent hover:text-[#43334C] hover:border-2 border-[#43334C] mb-1"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

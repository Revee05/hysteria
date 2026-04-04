"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useViewTracker } from "@/hooks/use-view-tracker";

/**
 * ArtistCard — kartu vertikal bergaya "Artist Radar" branded
 * Digunakan untuk: Artist Radar, dll.
 *
 * Props:
 *   src          : string
 *   alt          : string
 *   title        : string  — nama artist
 *   role         : string  — peran/deskripsi singkat (e.g. "Vocalist & Lyricist")
 *   episode      : string  — info episode (opsional, e.g. "Edisi 8")
 *   subtitle     : string  — fallback teks bawah jika role tidak ada
 *   predescription: string  — teks ringkasan/preview sebelum deskripsi penuh
 *   href         : string  — URL halaman detail (opsional)
 */
export default function ArtistCard({
  id,
  imageUrl,
  alt,
  title,
  prevdescription,
  host,
  guests,
  tags,
  href,
}) {
  const [showInfo, setShowInfo] = useState(false);
  const { trackView } = useViewTracker();

  const handleTrackClick = useCallback(() => {
    if (id) trackView(id);
  }, [id, trackView]);

  const imgSrc = imageUrl || "/image/artist.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  const handleClick = (e) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      setShowInfo((prev) => !prev);
    }
  };

  const inner = (
    <div
      className="group relative w-full aspect-9/16 overflow-hidden rounded-2xl cursor-pointer shadow-xl transform transition-transform duration-300 hover:-translate-y-4 hover:shadow-2xl"
      onClick={handleClick}
    >
      {/* Background image */}
      <Image
        src={imgSrc}
        alt={alt || title || "Artist image"}
        fill
        unoptimized={!isLocal}
        sizes="(max-width:640px) 50vw, 260px"
        className="object-cover brightness-75 transition-transform duration-300"
      />

      {/* Bottom overlay — info artist: hidden on mobile until clicked, always visible on md+ */}
      <div
        className={`p-3 absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-20 transition-opacity duration-300 md:opacity-100 ${
          showInfo ? "opacity-100" : "opacity-0"
        }`}
      >
        {title && (
          <h3 className="text-white text-[14px] md:text-sm font-bold leading-tight">
            {title}
          </h3>
        )}
        {prevdescription && (
          <p className="text-white/90 text-[11px] md:text-xs font-semibold mt-0.5 line-clamp-4">
            {prevdescription}
          </p>
        )}
        {host != null && (
          <p className="text-[10px] md:text-xs font-medium mt-1">
            <span style={{ color: "#E83C91" }} className="mr-1">
              Host:
            </span>
            <span className="text-white">{host || "—"}</span>
          </p>
        )}
        {guests && (
          <p className="text-[10px] md:text-xs font-medium mt-1 flex gap-x-1 items-start min-w-0 mb-3">
            <span style={{ color: "#E83C91" }} className="mr-1 shrink-0">
              Collabrator:
            </span>
            <span className="text-white line-clamp-2 md:line-clamp-3 wrap-break-word min-w-0 md:flex-1">
              {Array.isArray(guests) ? guests.join(", ") : guests || "-"}
            </span>
          </p>
        )}
        {href && showInfo && (
          <a
            href={href}
            className="md:hidden mt-2 block w-full text-center text-[11px] font-semibold py-1.5 rounded-lg"
            style={{ backgroundColor: "#E83C91", color: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            Lihat Detail
          </a>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleTrackClick} className="block">
        {inner}
      </Link>
    );
  }

  return <div onClick={handleTrackClick}>{inner}</div>;
}

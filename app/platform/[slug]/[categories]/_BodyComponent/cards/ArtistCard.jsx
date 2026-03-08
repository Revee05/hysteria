
"use client";

import Image from "next/image";

/**
 * ArtistCard — kartu vertikal bergaya "Artist Radar" branded
 * Digunakan untuk: Artist Radar, dll.
 *
 * Props:
 *   src      : string
 *   alt      : string
 *   title    : string  — nama artist
 *   role     : string  — peran/deskripsi singkat (e.g. "Vocalist & Lyricist")
 *   episode  : string  — info episode (opsional, e.g. "Edisi 8")
 *   subtitle : string  — fallback teks bawah jika role tidak ada
 */
export default function ArtistCard({
  imageUrl,
  alt,
  title,
  description,
  host,  
  guests,
  tags,
}) {
  const imgSrc = imageUrl || "/image/artist.webp";
  // const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");
  const guestText = Array.isArray(guests)
    ? guests.filter(Boolean).join(", ")
    : guests;

  return (
    <div className="group relative w-full aspect-[9/16] overflow-hidden rounded-3xl cursor-pointer shadow-xl transform transition-transform duration-300 hover:-translate-y-4 hover:shadow-2xl">
      {/* Background image */}
      <Image
        src={imgSrc}
        alt={alt || title || "Artist image"}
        fill
        // unoptimized={!isLocal}
        sizes="(max-width:640px) 50vw, 260px"
        className="object-cover brightness-75 transition-transform duration-300"
      />

      {/* Bottom overlay — info artist */}
      <div className="p-3 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-20">
          {title && (
            <h3 className="text-white text-sm font-bold leading-tight">{title}</h3>
          )}
          { description && (
            <p className="text-white/90 text-xs font-semibold mt-0.5 line-clamp-2">{description}</p>
          )}
          {host != null && (
            <p className="text-xs font-medium mt-1">
              <span style={{ color: "#E83C91" }} className="mr-1">Host:</span>
              <span className="text-white">{host || '—'}</span>
            </p>
          )}
          {guests && (
            <p className="text-xs font-medium mt-1 flex flex-row">
              <span style={{ color: "#E83C91" }} className="mr-1">Guests:</span>
              <span className="text-white">{Array.isArray(guests) ? guests.join(", ") : guests}</span>
            </p>
          )}
      </div>
    </div>
  );
}

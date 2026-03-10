"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * VideoCard — thumbnail landscape 16:9 dengan play button
 *
 * Props:
 *   src   : string  — URL YouTube atau path gambar lokal
 *   alt   : string
  *   title : string
  *   description : string — deskripsi singkat (opsional)
   *   badge : string  — teks badge pojok kiri atas (opsional)
   *   host : string — nama host (opsional)
   *   guests : string[] — daftar nama tamu (opsional)
 */

function extractYouTubeId(url) {
  if (typeof url !== "string") return null;
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)\/?([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export default function VideoCard({ imageUrl, youtube, url, alt, title, tags, description, host, guests, timestamp }) {
  const sourceForId = youtube || url || imageUrl;
  const ytId = extractYouTubeId(sourceForId);
  
  const bestYtImg = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
  const backupYtImg = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const initialImgSrc = ytId ? bestYtImg : (imageUrl || url || "/image/video.webp");

  const [imgSrc, setImgSrc] = useState(initialImgSrc);

  useEffect(() => {
    setImgSrc(initialImgSrc);
  }, [initialImgSrc]);

  const handleImageError = () => {
    if (ytId && imgSrc === bestYtImg) {
      setImgSrc(backupYtImg);
    }
  };

  const linkHref = youtube ? (youtube.includes("watch") ? youtube : (`https://www.youtube.com/watch?v=${ytId}`)) : (url || null);
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  const Wrapper = linkHref ? "a" : "div";
  const wrapperProps = linkHref
    ? { href: linkHref, target: "_blank", rel: "noopener noreferrer", "aria-label": title || alt || "Buka video" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="bg-white group relative flex flex-col h-full w-full overflow-hidden rounded-xl bg-zinc-100 border border-zinc-300 cursor-pointer shadow-xl transform transition-transform duration-300 hover:-translate-y-4 hover:shadow-xl hover:border-pink-500"
    >
      {/* Thumbnail 16:9 */}
      <div className="relative w-full aspect-video flex-shrink-0 bg-zinc-200">
        <Image
          src={imgSrc}
          alt={alt || title || "Video"}
          fill
          onError={handleImageError}
          unoptimized={!isLocal}
          sizes="(max-width:640px) 90vw, (max-width:1024px) 280px, 320px"
          className="object-cover brightness-90 transition-transform duration-300"
        />

        {/* Dark scrim */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition">
            <svg className="w-5 h-5 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        {/* Judul */}
        {title && (
          <div className="px-3 py-2 mt-2 md:px-4 md:py-2 md:mt-3 flex-shrink-0"> 
            <p className="font-lato text-zinc-800 text-xs md:text-base font-bold leading-tight line-clamp-2">{title}</p>
          </div>
        )}

        {/* Deskripsi */}
        {description && (
          <div className="px-3 md:px-4 md:pb-2 flex-shrink-0">
            <p className="text-zinc-600 text-xs leading-tight mt-1 line-clamp-4">{description}</p>
          </div>
        )}

        {/* Host & Guests */}
        <div className="px-3 py-1 md:px-4 md:py-2 md:pb-3 flex-shrink-0">
          <p className="text-xs font-medium truncate">
            <span style={{ color: "#E83C91" }} className="mr-1">Host:</span>
            <span className="text-zinc-600">{host || "-"}</span>
          </p>

          <p className="text-xs pt-1 line-clamp-2">
            <span style={{ color: "#E83C91" }} className="mr-1">Guests:</span>
            <span className="text-zinc-600">{(guests && guests.length) ? guests.join(", ") : "-"}</span>
          </p>
        </div>

        {/* tags list */}
        <div className="px-3 pb-3 md:px-4 md:pb-4 flex-shrink-0">
          {tags && tags.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1">
                <span style={{ color: "#E83C91" }} className="mr-1 text-xs">Tags:</span>
                {tags.map((t, idx) => (
                  <span key={idx} className="text-xs text-white bg-gradient-to-r from-pink-500 to-orange-900 rounded-full px-2">
                    {t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span style={{ color: "#E83C91" }} className="mr-1 text-xs">Tags: - </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

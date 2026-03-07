"use client";

import { useState, useRef, useEffect, use } from "react";
import Image from "next/image";

/**
 * PosterCard — kartu vertikal 2:3
 * Default: poster full cover tanpa overlay
 * Hover: blur + badge + info + tombol CTA
 *
 * Props:
 *   src      : string
 *   alt      : string
 *   title    : string
 *   subtitle : string
 *   badge    : string  — teks badge (e.g. "Akan Berlangsung", "Telah Berakhir")
 *   meta     : string  — info kecil (e.g. tanggal)
 */
export default function PosterCard({ imageUrl, alt, title, description, tags, meta }) {
  const imgSrc = imageUrl || "/image/DummyPoster.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  const [isOpen, setIsOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    // avoid calling setState synchronously inside effect to prevent cascading renders
    const id = setTimeout(() => setIsTouch(touch), 0);
    return () => clearTimeout(id);
  }, []);

  // close overlay when clicking/tapping outside
  useEffect(() => {
    if (!isOpen) return;
    function onDoc(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [isOpen]);

  // CTA text: show "Ikuti Sekarang" when badge indicates upcoming or live,
  // otherwise show "Detail". Comparison is case-insensitive.
  const badgeText = typeof badge === "string" ? badge.toLowerCase() : "";
  const isLiveOrUpcoming =
    badgeText === "akan dilaksanakan" || badgeText === "sedang berlangsung";
  const ctaText = isLiveOrUpcoming ? "Ikuti Sekarang" : "Detail";

  return (
    <div
      ref={wrapperRef}
      role="button"
      tabIndex={0}
      className="group relative w-full aspect-[2/3] overflow-hidden rounded-xl cursor-pointer"
      onClick={(e) => {
        // avoid toggling when clicking interactive elements
        const tgt = e.target;
        if (tgt && tgt.tagName) {
          const tag = tgt.tagName.toUpperCase();
          const interactive = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL"]; 
          if (interactive.includes(tag)) return;
        }
        setIsOpen((s) => !s);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen((s) => !s);
        }
      }}
    >
      {/* Cover image wrapper (absolute) — also rounded & overflow-hidden to avoid 1px gap */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <Image
          src={imgSrc}
          alt={alt || title || "Poster"}
          fill
          // unoptimized={!isLocal}
          priority={true}
          sizes="(max-width:640px) 50vw, 260px"
          className="object-cover block group-hover:scale-110"
          style={{ objectPosition: "center center", willChange: "transform" }}
        />

        {/* Hover overlay: badge top-left + metadata box bottom (above dim layer) */}
        <div
          className={
            "absolute inset-0 bg-black/40 z-10 transition-opacity duration-200 " +
            (isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto")
          }
        >
          {/* Badge positioned near top-left inside overlay (first tag) */}
          {(tags && tags.length > 0) && (
            <div className="absolute top-3 left-3 z-30 pointer-events-auto">
              <span className="bg-pink-500 text-white text-[10px] md:text-md font-semibold px-3 py-1 rounded-full shadow">
                {tags[0]}
              </span>
            </div>
          )}

          {/* Bottom metadata container */}
          <div className="absolute left-4 right-4 bottom-4 z-30 pointer-events-auto">
            <div className="bg-transparent py-3">
              {/* Title */}
              {title && (
                <h3 className="text-white text-xs md:text-base font-bold leading-tight drop-shadow-md">
                  {title}
                </h3>
              )}

              {/* Description */}
              {description && (
                <p className="text-white/80 text-xs md:text-base leading-tight mt-1 drop-shadow-md">
                  {description}
                </p>
              )}

              {/* Meta (e.g. tanggal) */}
              {meta && <p className="text-white/90 text-[11px] mt-1">{meta}</p>}

              {/* CTA button */}
              <div className="mt-3 flex justify-center">
                <span className="z-1000 inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                  {ctaText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

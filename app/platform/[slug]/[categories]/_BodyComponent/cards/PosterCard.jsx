"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useViewTracker } from "@/hooks/use-view-tracker";

export default function PosterCard({
  id,
  imageUrl,
  alt,
  title,
  description,
  tags,
  badge,
  meta,
  slug,
}) {
  const { trackView } = useViewTracker();

  const handleTrackClick = useCallback(() => {
    if (id) trackView(id);
  }, [id, trackView]);
  const imgSrc = imageUrl || "/image/DummyPoster.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function onDoc(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [isOpen]);

  const badgeLabel = badge || (tags && tags.length > 0 ? tags[0] : null);
  // Determine badge visual style with psychological color choices:
  // - upcoming: blue (trust, calm, future)
  // - ongoing: green (action, success, go)
  // - finished: gray (muted, archival)
  // - fallback (tags/other): pink accent as before
  const badgeLabelNorm = (badgeLabel || "").toLowerCase();
  // More translucent backgrounds + keep readable text colors for glassy effect
  let badgeClass =
    "bg-white/40 text-pink-500 border-white/25"; /* fallback (glassy) */
  if (
    badgeLabelNorm.includes("akan") ||
    badgeLabelNorm.includes("upcoming") ||
    (badgeLabelNorm.includes("berlangsung") && badgeLabelNorm.includes("akan"))
  ) {
    badgeClass = "bg-blue-100/40 text-blue-700 border-blue-100/40";
  } else if (
    badgeLabelNorm.includes("sedang") ||
    badgeLabelNorm.includes("ongoing")
  ) {
    badgeClass = "bg-green-100/40 text-green-500 border-green-100/50";
  } else if (
    badgeLabelNorm.includes("telah") ||
    badgeLabelNorm.includes("berakhir") ||
    badgeLabelNorm.includes("finished")
  ) {
    badgeClass = "bg-zinc-100/40 text-zinc-700 border-zinc-100/30";
  }

  return (
    <div
      ref={wrapperRef}
      role="button"
      tabIndex={0}
      className="group relative w-full aspect-2/3 overflow-visible rounded-xl cursor-pointer shadow-xl border-2 border-zinc-300"
      onClick={(e) => {
        const tgt = e.target;
        if (tgt && tgt.tagName) {
          const tag = tgt.tagName.toUpperCase();
          const interactive = [
            "A",
            "BUTTON",
            "INPUT",
            "SELECT",
            "TEXTAREA",
            "LABEL",
          ];
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
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        {/* Image — blurs and scales on hover */}
        <Image
          src={imgSrc}
          alt={alt || title || "Poster"}
          fill
          unoptimized={!isLocal}
          sizes="(max-width:640px) 50vw, 260px"
          className={`object-cover block transition-all duration-300 ${
            isOpen
              ? "scale-105 blur-xl brightness-50"
              : "group-hover:scale-105 group-hover:blur-xl group-hover:brightness-50 border border-zinc-300"
          }`}
          style={{ objectPosition: "center center" }}
        />

        {/* Badge — left-edge label that slightly overlaps the card */}
        {badgeLabel && (
          <div className="absolute top-1   left-0 z-30 transform -translate-x-3">
            <span
              className={`border ${badgeClass} backdrop-blur-sm md:backdrop-blur-md text-[9px] md:text-[11px] font-semibold px-3 py-0.5 rounded-r-full shadow-sm whitespace-nowrap`}
            >
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={
            "absolute inset-0 z-10 transition-opacity duration-200 " +
            (isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto")
          }
        >
          {/* Bottom white info panel */}
          <div className="absolute left-0 right-0 bottom-0 z-30 bg-transparent px-3 pt-3 pb-3 space-y-3">
            {title && (
              <h3 className="text-zinc-100 text-[12px] md:text-base font-semibold leading-snug line-clamp-2">
                {title}
              </h3>
            )}
            {meta && (
              <p className="text-zinc-100 text-[9px] md:text-xs mt-1 line-clamp-2">
                {meta}
              </p>
            )}
            {slug ? (
              <Link
                href={`/event/${slug}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrackClick();
                }}
                className="mt-2 w-full block bg-linear-to-r from-pink-500 to-orange-400 text-white text-[9px] md:text-xs font-semibold py-1.5 rounded-md cursor-pointer text-center"
              >
                Lihat Detail
              </Link>
            ) : (
              <button className="mt-2 w-full bg-linear-to-r from-pink-500 to-orange-400 text-white text-[9px] md:text-xs font-semibold py-1.5 rounded-md cursor-pointer">
                Lihat Detail
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

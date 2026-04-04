"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * PosterPreview — live preview for MockUpPosterCard / KomikRamuanCard-style content.
 * Card-only preview: 16:9 image on top, title (with optional year prefix), prevdescription, CTA button.
 *
 * Props mirror SubForm field values:
 *   title, prevdescription, year, imageFile, imageUrl
 */
export default function PosterPreview({
  title = "",
  prevdescription = "",
  year = "",
  imageFile = null,
  imageUrl = "",
}) {
  const [objUrl, setObjUrl] = useState(null);
  const prevFileRef = useRef(null);

  // Buat / revoke object URL setiap kali imageFile berubah
  useEffect(() => {
    if (imageFile instanceof File && imageFile !== prevFileRef.current) {
      if (objUrl) URL.revokeObjectURL(objUrl);
      const next = URL.createObjectURL(imageFile);
      setObjUrl(next);
      prevFileRef.current = imageFile;
    } else if (!imageFile && objUrl) {
      URL.revokeObjectURL(objUrl);
      setObjUrl(null);
      prevFileRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imgSrc = objUrl || imageUrl || "/image/DummyPoster.webp";
  const fullTitle = year && title ? `${year} - ${title}` : title || year || "";

  return (
    <div className="flex flex-col gap-3 items-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Preview Card</p>

      <div className="w-full max-w-[300px] min-h-screen mx-auto flex flex-col overflow-hidden rounded-xl border-2 border-zinc-300 bg-white shadow-md">
        {/* Image 16:9 */}
        <div className="relative w-full aspect-video bg-zinc-300 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={fullTitle || "Poster"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/image/DummyPoster.webp";
            }}
          />
        </div>

        {/* Konten */}
        <div className="flex flex-col gap-1 px-3 py-2 flex-1">
          {fullTitle && (
            <h3 className="text-zinc-900 text-[12px] font-bold leading-tight break-words">
              {fullTitle}
            </h3>
          )}
          {prevdescription && (
            <p className="text-zinc-600 text-[11px] leading-snug break-words">
              {prevdescription}
            </p>
          )}
          <div className="mt-auto pt-1">
            <button
              type="button"
              className="w-full rounded-lg bg-[#43334C] py-1 text-[11px] font-semibold text-white"
            >
              Lihat File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

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

/**
 * VideoPreview — live preview for VideoCard-style content (Anitalk, Homecooked).
 * Card-only preview mimicking VideoCard (16:9 thumbnail + play button + text).
 *
 * Props mirror SubForm field values:
 *   title, prevdescription, host, guests, youtube, url, imageFile, imageUrl
 */
export default function VideoPreview({
  title = "",
  prevdescription = "",
  host = "",
  guests = [],
  youtube = "",
  url = "",
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

  const ytId = extractYouTubeId(youtube || url);
  const thumbSrc =
    objUrl ||
    imageUrl ||
    (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "/image/video.webp");

  const guestList = Array.isArray(guests) ? guests.filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-3 items-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Preview Card</p>

      <div className="w-full max-w-[320px] h-full mx-auto">
        {/* Thumbnail 16:9 */}
        <div className="relative w-full aspect-video bg-zinc-800 rounded-t-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbSrc}
            alt={title || "Video"}
            className="absolute inset-0 w-full h-full object-cover brightness-90"
            onError={(e) => {
              e.currentTarget.src = "/image/video.webp";
            }}
          />
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white translate-x-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Teks di bawah thumbnail */}
        <div className="px-2.5 py-2 flex flex-col gap-1 bg-white border border-t-0 border-zinc-300 rounded-b-lg">
          {title && (
            <p className="text-zinc-800 text-[13px] font-semibold leading-tight break-words">
              {title}
            </p>
          )}
          {prevdescription && (
            <p className="text-zinc-500 text-[11px] leading-snug break-words">
              {prevdescription}
            </p>
          )}
          {(host || guestList.length > 0) && (
            <div className="text-[11px] text-zinc-400 break-words mt-0.5">
              {host && (
                <span>
                  Host: <span className="text-zinc-600">{host}</span>
                </span>
              )}
              {host && guestList.length > 0 && <span className="mx-1">·</span>}
              {guestList.length > 0 && (
                <span>
                  Guests:{" "}
                  <span className="text-zinc-600">{guestList.join(", ")}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

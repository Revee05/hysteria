"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * ArtistPreview — live preview panel for Artist Radar content.
 *
 * Renders two tabs:
 *   • "Card"           — replika tampilan ArtistCard di grid konten
 *   • "Halaman Detail" — replika layout halaman detail (page.jsx)
 *
 * Props mirror the SubForm field values + file upload state.
 */
export default function ArtistPreview({
  title = "",
  prevdescription = "",
  description = "",
  host = "",
  guests = [],
  tags = [],
  instagram = "",
  youtube = "",
  url = "",
  imageFile = null,        // File object dari UploadBox (add mode)
  imageUrl = "",           // URL gambar yang sudah ada (edit mode)
}) {
  const [tab, setTab] = useState("card");
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

  const imgSrc = objUrl || imageUrl || null;
  const guestsArr = Array.isArray(guests) ? guests.filter(Boolean) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Label */}
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Live Preview
      </p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "card", label: "Card" },
          { key: "page", label: "Halaman Detail" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              tab === key
                ? "bg-[#E83C91] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "card" && (
          <CardPreview
            imgSrc={imgSrc}
            title={title}
            prevdescription={prevdescription}
            host={host}
            guestsArr={guestsArr}
          />
        )}
        {tab === "page" && (
          <PagePreview
            imgSrc={imgSrc}
            title={title}
            description={description}
            host={host}
            guestsArr={guestsArr}
            tags={tags}
            instagram={instagram}
            youtube={youtube}
            url={url}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Card Preview ──────────────────────────────────────────────────────────── */

function CardPreview({ imgSrc, title, prevdescription, host, guestsArr }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] text-gray-400 italic">Tampilan di grid konten</p>

      <div className="w-[180px] md:w-[220px] lg:w-[260px]">
        <div className="relative w-full aspect-[9/16] overflow-hidden rounded-2xl shadow-xl bg-zinc-800">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={title || "Artist"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
              <svg
                className="w-8 h-8 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-zinc-500 text-[9px] text-center">Belum ada gambar</span>
            </div>
          )}

          {/* Info overlay — always visible in preview */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-4 pt-16">
            {title && (
              <p className="text-white text-[12px] md:text-[13px] font-bold leading-tight mb-1 break-words">
                {title}
              </p>
            )}
            {prevdescription && (
              <p className="text-white/80 text-[9px] md:text-[10px] mt-0.5 leading-tight break-words">
                {prevdescription}
              </p>
            )}
            {host && (
              <p className="text-[8px] font-medium mt-0.5">
                <span style={{ color: "#E83C91" }}>Host: </span>
                <span className="text-white">{host}</span>
              </p>
            )}
            {guestsArr.length > 0 && (
              <p className="text-[8px] font-medium mt-0.5">
                <span style={{ color: "#E83C91" }}>Collaborator: </span>
                <span className="text-white break-words">{guestsArr.join(", ")}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Empty state hints */}
      {!title && !prevdescription && (
        <p className="text-[10px] text-gray-400 italic text-center mt-1">
          Isi form untuk melihat preview
        </p>
      )}
    </div>
  );
}

/* ─── Page Preview ───────────────────────────────────────────────────────────── */

function PagePreview({
  imgSrc,
  title,
  description,
  host,
  guestsArr,
  tags,
  instagram,
  youtube,
  url,
}) {
  return (
    <div className="bg-zinc-50 rounded-lg border border-gray-200 shadow overflow-hidden">
      <p className="text-[10px] text-gray-400 italic text-center py-1.5 border-b border-gray-100 bg-zinc-50">
        Tampilan halaman detail
      </p>

      <div className="p-3">
        <div className="flex gap-3 bg-white rounded-lg border border-gray-100 p-3 shadow-sm">

          {/* Image column */}
          <div className="w-[100px] shrink-0">
            <div
              className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-gray-300 bg-zinc-200 shadow"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,60,145,0.06), rgba(99,102,241,0.04))",
              }}
            >
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt={title || "Artist"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="text-zinc-400 text-[8px] text-center leading-tight">
                    Belum ada gambar
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content column */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {title ? (
              <h3 className="text-[12px] font-bold text-[#43334C] leading-tight mb-2">
                {title}
              </h3>
            ) : (
              <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
            )}

            {/* Description */}
            {description ? (
              <p className="text-zinc-600 text-[9px] leading-[14px] mb-2 text-justify whitespace-pre-line break-words">
                {description}
              </p>
            ) : (
              <div className="space-y-1 mb-2">
                <div className="h-2 bg-gray-100 rounded w-full" />
                <div className="h-2 bg-gray-100 rounded w-5/6" />
                <div className="h-2 bg-gray-100 rounded w-4/5" />
              </div>
            )}

            {/* Guests & Host */}
            {(guestsArr.length > 0 || host) && (
              <div className="space-y-0.5 mb-2">
                {guestsArr.length > 0 && (
                  <p className="text-[9px]">
                    <span className="font-semibold text-zinc-700">Artist. Collaborator: </span>
                    <span className="text-pink-500">{guestsArr.join(", ")}</span>
                  </p>
                )}
                {host && (
                  <p className="text-[9px]">
                    <span className="font-semibold text-zinc-700">Project Director & Host: </span>
                    <span className="text-pink-500">{host}</span>
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {Array.isArray(tags) && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded-full text-[7px] font-medium underline"
                    style={{ backgroundColor: "#fce7f3", color: "#E83C91" }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-1 mt-1">
              {instagram && (
                <span className="px-2 py-0.5 text-[8px] rounded border border-pink-400 text-pink-500">
                  Instagram
                </span>
              )}
              {youtube && (
                <span className="px-2 py-0.5 text-[8px] rounded border border-pink-400 text-pink-500">
                  YouTube
                </span>
              )}
              {url && (
                <span className="px-2 py-0.5 text-[8px] rounded border border-zinc-300 text-zinc-600">
                  Selengkapnya
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

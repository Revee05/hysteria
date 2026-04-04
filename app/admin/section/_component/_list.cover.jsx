/**
 * _list.cover.jsx
 *
 * Komponen accordion untuk menampilkan dan mengelola daftar slot cover image.
 * Setiap item dapat di-expand untuk menampilkan UploadBox.
 *
 * Props:
 *  items         – array of { id, label, files, imageUrl? }
 *                  imageUrl diisi dari data API (gambar yang sudah tersimpan)
 *  onFilesChange – (id, newFiles, clearImage?) => void
 *                  clearImage=true dikirim saat user menekan tombol hapus gambar
 */
"use client";

import React, { useState } from "react";
import UploadBox from "../../../../components/adminUI/UploadBox.jsx";

/** Ikon chevron yang berputar 180° saat accordion terbuka. */
function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * ListCover – accordion list for cover-image items.
 *
 * Props:
 *  items         – array of { id, label, files }
 *  onFilesChange – (id, newFiles) => void
 *  maxSizeMB     – number  max upload size in MB
 */
export default function ListCover({ items = [], onFilesChange, maxSizeMB }) {
  // Hanya satu item yang bisa terbuka sekaligus; null = semua tertutup
  const [openId, setOpenId] = useState(null);

  // Toggle: buka item yang ditutup, tutup item yang sudah terbuka
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="border border-gray-300 rounded-lg overflow-hidden"
          >
            {/* Header / toggle */}
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-pink-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ChevronIcon open={isOpen} />
                <span className="text-sm font-medium text-gray-800 ">
                  {item.label}
                </span>
              </div>
            </button>

            {/* Collapsible body */}
            {isOpen && (
              <div className="px-5 pb-5 pt-3 bg-white border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Gambar
                </label>
                <UploadBox
                  files={Array.isArray(item.files) ? item.files : []}
                  setFiles={(newFiles) => onFilesChange(item.id, Array.isArray(newFiles) ? newFiles : Array.from(newFiles || []))}
                  existingUrl={item.imageUrl || null}  // tampilkan gambar tersimpan jika ada
                  onClearExisting={() => onFilesChange(item.id, [], true)}  // true = tandai pendingClear di parent
                  accept="image/*"
                  maxSizeMB={maxSizeMB}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * _list.hero.jsx
 *
 * Komponen accordion untuk menampilkan dan mengelola daftar slot hero image.
 * Berbeda dari _list.cover: setiap item hero juga memiliki field teks (title, subtitle).
 *
 * Props:
 *  items         – array of { id, label, title, subtitle, files, imageUrl? }
 *  onFilesChange – (id, newFiles, clearImage?) => void
 *  onItemChange  – (id, { title?, subtitle? }) => void  — dipanggil saat teks berubah
 */
"use client";

import React, { useState } from "react";
import UploadBox from "../../../../components/adminUI/UploadBox.jsx";

/** Icon panah yang berotasi 180° saat accordion terbuka. */
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
 * ListHero – accordion list for hero items.
 *
 * Props:
 *  items         – array of { id, label, title, subtitle, files }
 *  onFilesChange – (id, newFiles) => void
 *  onItemChange  – (id, changes) => void
 *  maxSizeMB     – number  max upload size in MB
 */
export default function ListHero({ items = [], onFilesChange, onItemChange = () => {}, maxSizeMB }) {
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
                <span className="text-sm font-medium text-gray-800">
                  {item.label}
                </span>
              </div>
            </button>

            {/* Collapsible body */}
            {isOpen && (
              <div className="px-5 pb-5 pt-3 bg-white border-t border-gray-100 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => onItemChange(item.id, { title: e.target.value })}
                      className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                      placeholder="Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ""}
                      onChange={(e) => onItemChange(item.id, { subtitle: e.target.value })}
                      className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                      placeholder="Subtitle / deskripsi singkat"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Gambar
                  </label>
                  <UploadBox
                    files={Array.isArray(item.files) ? item.files : []}
                    setFiles={(newFiles) =>
                      onFilesChange(
                        item.id,
                        Array.isArray(newFiles) ? newFiles : Array.from(newFiles || [])
                      )
                    }
                    existingUrl={item.imageUrl || null}  // tampilkan gambar tersimpan jika ada
                    onClearExisting={() => onFilesChange(item.id, [], true)}  // true = tandai pendingClear di parent
                    accept="image/*"
                    maxSizeMB={maxSizeMB}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

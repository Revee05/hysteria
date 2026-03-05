/**
 * form.hero.jsx
 *
 * Wrapper form untuk tab "Bagian Hero".
 * Komponen ini fully controlled — semua state (items) dikelola oleh parent Page.
 *
 * Props:
 *  items         – array hero items dengan title, subtitle, files, imageUrl
 *  onFilesChange – (id, newFiles, clearImage?) => void
 *  onItemChange  – (id, changes) => void  — untuk update title/subtitle
 *  onSubmit      – (items) => void  — dipanggil dengan items terkini saat tombol Simpan diklik
 *  submitting    – boolean  — true selama proses save berlangsung
 *  maxSizeMB     – number  max upload size in MB (set by parent Page)
 */
"use client";
import React from "react";
import ListHero from "./_list.hero.jsx";
import PermissionGate from "../../../../components/adminUI/PermissionGate.jsx";

export default function FormHero({
  items = [],
  onFilesChange = () => {},
  onItemChange = () => {},
  onSubmit = () => {},
  submitting = false,
  maxSizeMB = '',
}) {
  return (
    <div className="bg-white rounded">
      <ListHero
        items={items}
        onFilesChange={onFilesChange}
        onItemChange={onItemChange}
        maxSizeMB={maxSizeMB}
      />

      <div className="mt-4 flex justify-end">
        <PermissionGate requiredPermissions={"platform.update"} disableOnDenied>
          <button
            type="button"
            onClick={() => onSubmit(items)}
            disabled={submitting}
            className="px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}

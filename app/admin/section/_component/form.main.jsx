"use client";

import React from "react";
import UploadBox from "../../../../components/adminUI/UploadBox.jsx";
import ListCover from "./_list.cover.jsx";
import PermissionGate from "../../../../components/adminUI/PermissionGate.jsx";

/**
 * FormMain — fully controlled. All state lives in the parent Page component.
 *
 * Props:
 *  form             – { headline, subHeadline, instagram, youtube, youtubeProfile }
 *  onFormChange     – (updater) => void  (receives a setter-style function or new object)
 *  files            – File[] for the main platform image
 *  onMainFilesChange – (newFiles) => void
 *  coverItems       – array of cover items with files
 *  onFilesChange    – (id, newFiles) => void  for cover items
 *  onSubmit         – () => void  called when Save is clicked
 *  submitting       – boolean
 */
export default function FormMain({
  form = {},
  onFormChange = () => {},
  files = [],
  onMainFilesChange = () => {},
  onClearMainImage = () => {},
  coverItems = [],
  onFilesChange = () => {},
  onSubmit = () => {},
  submitting = false,
}) {
  // Controlled input: update satu field di `form` tanpa menimpa field lain
  const handleChange = (e) =>
    onFormChange((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Cegah default submit HTML agar tidak reload halaman, lalu delegasikan ke parent
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Headline*
        </label>
        <input
          name="headline"
          value={form.headline || ""}
          onChange={handleChange}
          className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
          placeholder="Masukkan headline"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sub Headline*
        </label>
        <textarea
          name="subHeadline"
          value={form.subHeadline || ""}
          onChange={handleChange}
          rows={4}
          className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
          placeholder="Sub headline / deskripsi singkat"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instagram (Optional)
          </label>
          <input
            name="instagram"
            value={form.instagram || ""}
            onChange={handleChange}
            className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Youtube (Optional)
          </label>
          <input
            name="youtube"
            value={form.youtube || ""}
            onChange={handleChange}
            className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Gambar Utama
        </label>
        <UploadBox
          files={files}
          setFiles={onMainFilesChange}
          existingUrl={form.mainImageUrl || null}
          onClearExisting={onClearMainImage}
          accept="image/*"
          maxSizeMB={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Link Youtube untuk media profile*
        </label>
        <input
          name="youtubeProfile"
          value={form.youtubeProfile || ""}
          onChange={handleChange}
          className="mt-2 p-2 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
          placeholder="https://www.youtube.com/..."
        />
      </div>

      <div className="mt-6">
        <ListCover items={coverItems} onFilesChange={onFilesChange} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <PermissionGate requiredPermissions={"platform.update"} disableOnDenied>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-pink-500 text-white rounded-md font-semibold disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </PermissionGate>
      </div>
    </form>
  );
}

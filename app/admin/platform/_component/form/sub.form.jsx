"use client";

import React, { useState } from 'react';
import validateSubForm from './validator.subform';
import UploadBox from '@/components/adminUI/UploadBox';

export default function SubForm({ open = false, mode = 'add', initialData = null, onClose = () => {}, onSubmit = () => {}, saving = false, showImageUpload = false }) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [year, setYear] = useState(initialData?.year ?? '');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [errors, setErrors] = useState({ title: '', year: '', url: '', image: '' });
  const [files, setFiles] = useState([]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...(initialData ?? {}),
      title: title,
      year: year,
      url: url,
      ...(showImageUpload && files.length > 0 ? { files } : {}),
    };
    const nextErrors = validateSubForm(payload);
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((v) => v && v.length > 0);
    // Validate file extensions on client-side when image upload is enabled
    if (showImageUpload && files.length > 0) {
      const allowed = ["image/webp", "image/jpeg", "image/png"];
      const invalidFile = files.find((f) => !allowed.includes(f.type));
      if (invalidFile) {
        setErrors((s) => ({ ...s, image: 'Tipe file tidak diperbolehkan. Hanya webp, jpg/jpeg, png.' }));
        return;
      }
      // clear any previous image error
      setErrors((s) => ({ ...s, image: '' }));
    }
    if (hasError) return;

    // clear errors and submit
    setErrors({ title: '', year: '', url: '' });
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
        <form onSubmit={handleSubmit} className="relative bg-white rounded-md shadow-lg w-full max-w-lg md:max-w-2xl mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{mode === 'add' ? 'Tambah Item' : 'Edit Item'}</h3>
                <button type="button" onClick={onClose} className="text-gray-600 hover:text-red-500 cursor-pointer">✕</button>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Title"
                required
            />
            {errors.title ? <p className="text-sm text-red-600 mt-1">{errors.title}</p> : null}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Tahun"
                />
                {errors.year ? <p className="text-sm text-red-600 mt-1">{errors.year}</p> : null}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link | URL</label>
                <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="gunakan URL youtube, instagram or Gdrive"
                />
                {errors.url ? <p className="text-sm text-red-600 mt-1">{errors.url}</p> : null}
            </div>

            {showImageUpload && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <UploadBox
                  files={files}
                  setFiles={setFiles}
                  existingUrl={mode === 'edit' && initialData?.images?.[0]?.imageUrl ? initialData.images[0].imageUrl : null}
                  maxSizeMB={10}
                  accept="image/webp,image/jpeg,image/png"
                />
                {errors.image ? <p className="text-sm text-red-600 mt-1">{errors.image}</p> : null}
              </div>
            )}

            <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setErrors({ title: '', year: '', url: '' }); setFiles([]); onClose(); }} disabled={saving} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-300 cursor-pointer disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded-md bg-[#43334C] text-white hover:bg-[#2e2237] cursor-pointer disabled:opacity-60">
                  {saving ? 'Menyimpan...' : 'Save'}
                </button>
            </div>
        </form>
    </div>
  );
}

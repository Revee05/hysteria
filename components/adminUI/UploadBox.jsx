"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

/**
 * UploadBox
 *
 * Props:
 *  files         – File[] currently staged for upload
 *  setFiles      – (newFiles: File[]) => void
 *  existingUrl   – string | null  — URL of the already-saved image from the server
 *  onClearExisting – () => void   — called when the user removes the existing image
 *  accept        – string (default "image/*")
 *  maxSizeMB     – number (default 5)
 */
export default function UploadBox({
  files = [],
  setFiles,
  existingUrl = null,
  onClearExisting = null,
  accept = "image/*",
  maxSizeMB = '',
}) {
  const fileRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  useFilePreviews(files, setPreviews);

  const handleFiles = (incoming) => {
    const arr = Array.from(incoming).filter((f) => f.size <= maxSizeMB * 1024 * 1024);
    setFiles([...files, ...arr]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e) => handleFiles(e.target.files);

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  // Show existing saved image when no new file is staged
  const showExisting = existingUrl && files.length === 0;

  return (
    <div>
      {/* Existing saved image preview */}
      {showExisting && (
        <div className="mb-3 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <Image
            src={existingUrl}
            alt="Gambar tersimpan"
            width={56}
            height={56}
            className="w-14 h-14 object-cover rounded"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Gambar tersimpan</p>
            <p className="text-xs text-gray-400 truncate">{existingUrl.split("/").pop()}</p>
          </div>
          {onClearExisting && (
            <button
              type="button"
              onClick={onClearExisting}
              className="text-xs text-red-500 cursor-pointer hover:underline shrink-0"
            >
              Hapus
            </button>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-2 flex items-center justify-center flex-col gap-3 border-2 border-dashed border-gray-300 rounded-md p-3 text-center text-sm text-gray-500">
        <svg width="64" height="64" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
          <path d="M36.5843 9.14453C27.1639 9.14453 19.7555 16.3013 18.7197 25.436C16.7278 25.7582 14.8599 26.6124 13.3132 27.9083C11.7666 29.2042 10.5986 30.8938 9.93265 32.7986C4.3078 34.4197 0 39.4364 0 45.7289C0 53.3293 6.11873 59.448 13.7191 59.448H59.4495C67.0499 59.448 73.1687 53.3293 73.1687 45.7289C73.1687 41.7046 71.2137 38.101 68.3807 35.5813C67.8502 27.5465 61.4411 21.135 53.3765 20.7189C50.6236 14.0217 44.3082 9.14453 36.5843 9.14453ZM36.5843 13.7176C42.8997 13.7176 47.9483 17.7647 49.7318 23.5039L50.2349 25.1502H52.59C58.8893 25.1502 64.0226 30.2834 64.0226 36.5828V37.726L64.9509 38.4417C66.0713 39.3004 66.9817 40.4027 67.6132 41.6652C68.2446 42.9277 68.5806 44.3173 68.5956 45.7289C68.5956 50.933 64.6537 54.8749 59.4495 54.8749H13.7191C8.515 54.8749 4.57304 50.933 4.57304 45.7289C4.57304 41.1101 7.8885 37.5248 12.0728 36.7977L13.5751 36.5119L13.8609 35.0074C14.5468 31.9274 17.277 29.7232 20.5787 29.7232H22.8652V27.4367C22.8652 19.7311 28.8788 13.7176 36.5843 13.7176ZM36.5843 26.5084L34.938 28.0792L25.792 37.2253L29.0845 40.5179L34.2978 35.2955V50.3019H38.8709V35.2955L44.0841 40.5133L47.3767 37.2207L38.2306 28.0746L36.5843 26.5084Z" fill="currentColor"/>
        </svg>

        <div className="text-xs">{showExisting ? "Upload gambar baru untuk mengganti" : "Drag & Drop files here or"}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1 text-gray-400 text-sm cursor-pointer bg-white border border-pink-400 rounded-md hover:bg-pink-600 hover:text-white transition-colors">
            Upload File
          </button>          
        </div>

        <p className="text-xs mt-1">Max file size: {maxSizeMB} MB</p>

        <input ref={fileRef} type="file" accept={accept} multiple className="hidden" onChange={onFileChange} />

        {files.length > 0 && (
          <ul className="mt-3 w-full max-h-48 overflow-auto space-y-2 text-sm text-gray-700 text-left border-t border-gray-300 pt-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-4 bg-white/30 px-3 py-2 rounded">
                <div className="flex items-center gap-3 min-w-0">
                  {previews[i] && previews[i].url ? (
                    <Image
                      src={previews[i].url}
                      alt={f.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">FILE</div>
                  )}
                  <span className="truncate">{f.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(i)} className="text-xs text-red-500 cursor-pointer hover:underline">
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// create/revoke previews when `files` changes
function useFilePreviews(files, setPreviews) {
  useEffect(() => {
    const created = files.map((f) => ({
      name: f.name,
      url: f.type && f.type.startsWith("image") ? URL.createObjectURL(f) : null,
    }));
    setPreviews(created);

    return () => {
      created.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [files, setPreviews]);
}

// hook usage
// Note: we call the hook inside the module scope of component render by invoking here
// to ensure previews stay in sync. React hooks must be called from component - we'll call inside component below.

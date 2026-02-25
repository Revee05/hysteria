"use client";

import { useRef, useState, useEffect } from "react";

export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false); 

  useEffect(() => {
    if (value && !preview) {
      setPreview(value);
      const parts = value.split("/");
      setFileName(parts[parts.length - 1] || "");
    }

    if (!value) {
      setPreview(null);
      setFileName("");
    }
  }, [value, preview]);

  const handleSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    // Upload ke server
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/events/upload-poster", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Response bukan JSON atau kosong");
      }

      if (res.ok && data.url) {
        onChange(data.url); // kirim URL ke parent
      } else {
        alert("Gagal upload poster: " + (data?.message || "Server error"));
        resetInput();
      }
    } catch (err) {
      console.error(err);
      alert("Server error saat upload poster");
      resetInput();
    } finally {
      setUploading(false);
    }
  };

  const resetInput = () => {
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
    onChange(""); // user memang ingin hapus
  };

  return (
    <div className="space-y-3">
      {/* PREVIEW AREA */}
      <div
        className={`w-full h-52 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer ${
          preview ? "border-gray-300" : "border-black"
        }`}
        onClick={() => !preview && inputRef.current.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Poster Preview"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-center space-y-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Poster"}
            </button>
            <p className="text-sm text-black">PNG / JPG</p>
          </div>
        )}
      </div>

      {/* FILE NAME */}
      {fileName && (
        <div className="text-sm font-medium text-black truncate">{fileName}</div>
      )}

      {/* ACTION BUTTONS */}
      {preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="px-4 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition"
            disabled={uploading}
          >
            Ganti Poster
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
          >
            Hapus
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}

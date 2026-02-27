"use client";

import { useState } from "react";

export default function TagInput({ value = [], onChange }) {
  const [newTag, setNewTag] = useState("");

  const normalize = (tag) =>
    tag.trim().toLowerCase();

  const addTag = () => {
    const tag = normalize(newTag);

    if (!tag) return;
    if (value.includes(tag)) return;

    onChange([...value, tag]);
    setNewTag("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <label className="block font-semibold mb-2">
        Tags / Keywords
      </label>

      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Masukkan tag"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // 🔴 PENTING
              addTag();
            }
          }}
        />

        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-[#4B3D52] text-white rounded-lg"
        >
          +
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {value.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="px-3 py-1 bg-gray-200 rounded-md text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-600 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
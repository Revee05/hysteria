"use client";

import { useState, useEffect } from "react";

export default function TagInput({ value = [], onChange }) {
  const [newTag, setNewTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const normalize = (tag) => tag.trim().toLowerCase();

  // fetch tag dari DB
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        setAllTags(data.data || []);
      })
      .catch(() => setAllTags([]));
  }, []);

  // filter suggestion
  useEffect(() => {
    if (!newTag) {
      setSuggestions([]);
      return;
    }

    const filtered = allTags.filter((tag) =>
      tag.name.toLowerCase().includes(newTag.toLowerCase())
    );

    setSuggestions(filtered);
  }, [newTag, allTags]);

  const addTag = (tagInput = newTag) => {
    const tag = normalize(tagInput);

    if (!tag) return;
    if (tag.includes(" ")) return; // 🚫 tidak boleh spasi
    if (value.includes(tag)) return;

    onChange([...value, tag]);
    setNewTag("");
    setSuggestions([]);
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <label className="block font-semibold mb-2">
        Tags / Keywords
      </label>

      <div className="relative flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Masukkan tag"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }

            if (e.key === " ") {
              e.preventDefault(); // 🚫 blok spasi
            }
          }}
        />

        <button
          type="button"
          onClick={() => addTag()}
          className="px-4 py-2 bg-[#4B3D52] text-white rounded-lg"
        >
          +
        </button>

        {/* suggestion dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow z-20">
            {suggestions.map((tag) => (
              <div
                key={tag.name}
                onClick={() => addTag(tag.name)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
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
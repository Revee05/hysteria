"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

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
    if (tag.includes(" ")) return; // tidak boleh spasi
    if (value.includes(tag)) return;

    onChange([...value, tag]);
    setNewTag("");
    setSuggestions([]);
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-300 shadow-sm space-y-2">
      <label className="block text-sm font-semibold text-[var(--Color-5)]">
        Tags / Keywords
      </label>

      <div className="relative">
        <div className="flex items-center rounded border border-gray-300 transition-all overflow-hidden">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 h-[42px] px-2 text-sm outline-none bg-transparent"
            placeholder="Masukkan tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }

              if (e.key === " ") {
                e.preventDefault(); // blok spasi
              }
            }}
          />
          <button
            type="button"
            onClick={() => addTag()}
            className="h-[42px] px-2 bg-[var(--Color-1)] flex items-center justify-center leading-none text-white text-sm font-medium hover:opacity-90 active:scale-95 transition"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
        
        {/* suggestion dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-fadeIn max-h-48 overflow-y-auto">
            {suggestions.map((tag) => (
              <div
                key={tag.name}
                onClick={() => addTag(tag.name)}
                className="px-4 py-2 text-sm text-[var(--Color-5)] hover:bg-[var(--Color-1)]/10 hover:text-[var(--Color-1)] cursor-pointer transition"
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* tag list */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[var(--Color-1)]/10 text-[var(--Color-1)] border border-[var(--Color-1)]/30 hover:bg-[var(--Color-1)]/20 transition"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-[var(--Color-1)] hover:text-red-500 transition"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
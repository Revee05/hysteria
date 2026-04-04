"use client";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CategorySelect({
  categoryItems,
  categoryIds,
  toggleCategory,
  categoryOpen,
  setCategoryOpen,
  categoryRef,
  inputClass,
  getCategoryTitle
}) {
  return (
    <div ref={categoryRef} className="relative space-y-2">
      {categoryIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryIds.map((id) => (
            <span
              key={id}
              className="bg-[var(--muted)] px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {getCategoryTitle(id)}
              <button
                type="button"
                onClick={() => toggleCategory(id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setCategoryOpen(!categoryOpen)}
        className={`${inputClass} flex items-center justify-between`}
      >
        <span>
          {categoryIds.length > 0
            ? `${categoryIds.length} kategori dipilih`
            : "Pilih kategori"}
        </span>
        {categoryOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {categoryOpen && (
        <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto border bg-[var(--background)] shadow rounded-lg">
          {categoryItems.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-2 px-3 py-2 hover:bg-[var(--muted)] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={categoryIds.includes(item.id)}
                onChange={() => toggleCategory(item.id)}
                className="
                    w-4 h-4
                    appearance-auto
                    accent-[var(--Color-1)]
                    bg-white
                    border
                    border-[var(--Color-3)]
                    rounded
                    cursor-pointer
                "
              />

              <div>
                <p className="text-sm">{item.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {item.source}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
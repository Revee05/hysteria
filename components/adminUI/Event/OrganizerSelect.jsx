"use client";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function OrganizerSelect({
  organizerItems,
  organizerIds,
  toggleOrganizer,
  organizerOpen,
  setOrganizerOpen,
  organizerRef,
  inputClass,
  getOrganizerTitle
}) {
  return (
    <div ref={organizerRef} className="relative space-y-2">
      {organizerIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {organizerIds.map((id) => (
            <span
              key={id}
              className="bg-[var(--btn-light)] text-[var(--Color-1)] px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {getOrganizerTitle(id)}
              <button
                type="button"
                onClick={() => toggleOrganizer(id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOrganizerOpen(!organizerOpen)}
        className={`${inputClass} flex items-center justify-between`}
      >
        <span>
          {organizerIds.length > 0
          ? `${organizerIds.length} penyelenggara dipilih`
          : "Pilih penyelenggara"}
        </span>    
        {organizerOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {organizerOpen && (
        <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto border bg-[var(--background)] shadow rounded-lg">
          {organizerItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--muted)] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={organizerIds.includes(item.id)}
                onChange={() => toggleOrganizer(item.id)}
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
              {item.title}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
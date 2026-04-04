"use client";

import { formatDateTime } from "@/lib/utils/formatDate";

export default function Activity({ text, time }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="w-2 h-2 mt-2 rounded-full bg-pink-500"></div>

      <div className="flex-1">
        <p className="text-sm font-medium">{text}</p>
        <p className="text-xs text-zinc-400">
          {time ? formatDateTime(time) : "-"}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function Toast({ message = "", type = "info", visible = false, onClose = () => {} }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  if (!visible || !message) return null;

  const bg = type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-zinc-900";

  return (
    <div aria-live="assertive" className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none px-4">
      <div className={`pointer-events-auto mt-6 rounded-lg px-4 py-2 text-sm font-medium text-white ${bg} shadow-lg`}>
        {message}
      </div>
    </div>
  );
}

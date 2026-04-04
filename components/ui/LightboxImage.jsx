"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function LightboxImage({ src, alt, isLocal, className = "" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function computeDisplaySize(nw, nh) {
    const maxW = window.innerWidth * 0.9;
    const maxH = window.innerHeight * 0.9;
    const scale = Math.min(maxW / nw, maxH / nh, 1);
    return { w: Math.round(nw * scale), h: Math.round(nh * scale) };
  }

  function openAndLoad() {
    setOpen(true);
    setLoading(true);
    const img = new window.Image();
    img.onload = () => {
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      setNatural({ w: nw, h: nh });
      const d = computeDisplaySize(nw, nh);
      setDisplay(d);
      setLoading(false);
    };
    img.onerror = () => {
      // fallback: open modal with viewport-filling size
      setNatural({ w: 0, h: 0 });
      setDisplay({ w: Math.round(window.innerWidth * 0.9), h: Math.round(window.innerHeight * 0.9) });
      setLoading(false);
    };
    img.src = src;
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <div className="relative flex items-center justify-center">
        {loading ? (
          <div className="w-auto h-auto rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : (
          <div style={{ width: display.w, height: display.h }} className="relative rounded-xl overflow-hidden">
            <Image
              src={src}
              alt={alt}
              width={display.w}
              height={display.h}
              unoptimized={!isLocal}
              className="object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup gambar"
          className="absolute top-3 right-3 bg-white/10 text-zinc-100 rounded-md p-2 shadow-md cursor-pointer hover:bg-white/20 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={openAndLoad}
        className={`w-full h-full block p-0 m-0 text-left ${className}`}
        aria-label={alt || "Open image"}
      >
        <div className="relative w-full h-full">
          <Image src={src} alt={alt} fill unoptimized={!isLocal} className="object-cover" />
        </div>
      </button>

      {open && typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </>
  );
}

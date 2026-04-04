// components/adminUI/program-page/TabBagianHero.jsx
"use client";

import { useState } from "react";
// PENTING: Pastikan path ImageUpload ini sesuai dengan lokasi komponenmu!
import ImageUpload from "@/components/adminUI/Event/ImageUpload";

// Komponen Accordion Custom
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden mb-4 shadow-sm">
      <button
        type="button"
        className="w-full bg-gray-50 flex items-center justify-between p-4 font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400">≡</span>
          <span>{title}</span>
        </div>
        <span className={`transform transition-transform text-gray-500 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="p-5 bg-white border-t border-gray-200">{children}</div>}
    </div>
  );
};

export default function TabBagianHero({ slugHeros, setSlugHeros }) {
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-black placeholder-gray-400";

  // Daftar semua kategori yang butuh Hero
  const categoryList = [
    { key: "festivalKampung", label: "Hero Page Festival Kampung" },
    { key: "festivalKota", label: "Hero Page Festival Kota" },
    { key: "biennale", label: "Hero Page Biennale" },
    { key: "forum", label: "Hero Page Forum" },
    { key: "musik", label: "Hero Page Musik" },
    { key: "flashResidency", label: "Hero Page Flash Residency" },
    { key: "kandangTandang", label: "Hero Page Kandang Tandang" },
    { key: "safariMemori", label: "Hero Page Safari Memori" },
    { key: "pemutaranFilm", label: "Hero Page Pemutaran Film" },
    { key: "sapaWarga", label: "Hero Page Sapa Warga" },
    { key: "hysteriaBerkelana", label: "Hero Page Hysteria Berkelana" },
  ];

  const handleHeroChange = (categoryKey, field, value) => {
    setSlugHeros((prev) => ({
      ...prev,
      [categoryKey]: {
        ...(prev[categoryKey] || { title: "", subtitle: "", image: "" }),
        [field]: value,
      },
    }));
  };

  const handleDetailChange = (field, value) => {
    setSlugHeros((prev) => ({
      ...prev,
      detail: {
        ...(prev.detail || { image: "", isBlur: false }),
        [field]: value,
      },
    }));
  };

  // ==============================================================
  // UI UPLOAD SUPERADMIN (Preview Kotak Memanjang/Landscape)
  // ==============================================================
  const UploadWithFigmaDesign = ({ value, onChange, sizeText = "Size: 1920 x 850 px" }) => (
    <div className="pt-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar</label>
      
      {/* Wadah Utama Abu-abu Terang */}
      <div className="bg-[#EBEBEB] border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        
        {/* ATAS: Area Drag & Drop (Full Width) */}
        <div className="w-full relative border-[1.5px] border-dashed border-gray-500 rounded-xl flex flex-col items-center justify-center py-8 px-4 text-center bg-transparent overflow-hidden group">
          
          {/* OVERLAY INVISIBLE */}
          <div className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-pointer flex flex-col [&>*]:flex-1 [&>*]:w-full [&>*]:h-full [&_div]:w-full [&_div]:h-full">
            <ImageUpload value={value} onChange={onChange} />
          </div>

          {/* VISUAL UI DRAG & DROP */}
          <div className="z-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
            <svg className="w-12 h-12 text-black mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <h3 className="text-[17px] font-extrabold text-black mb-1">Drag & Drop files here</h3>
            <p className="text-sm text-black mb-3">or <span className="underline">browse to upload</span></p>
            <p className="text-xs text-black mb-4">{sizeText}</p>
            <div className="px-10 py-2 bg-white border-[1.5px] border-[#E83C91] text-[#E83C91] font-bold rounded-lg shadow-sm">
              Upload
            </div>
          </div>
        </div>

        {/* BAWAH: Thumbnail Preview (Memanjang ke samping, tinggi ditahan max 300px) */}
        {value && (
          <div className="w-full h-[250px] md:h-[300px] relative border border-gray-300 rounded-xl bg-[#E2E2E2] flex items-center justify-center overflow-hidden group/preview mt-1 p-2">
            
            {/* Gambar full utuh (contain) di dalam kotak yang memanjang */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-contain drop-shadow-md rounded-md" />
            
            {/* Tombol Hapus */}
            <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-xl">
              <button 
                type="button"
                onClick={() => onChange("")} 
                className="text-white text-sm font-bold px-6 py-2.5 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors z-30 cursor-pointer shadow-lg"
              >
                Hapus Gambar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2 animate-fadeIn">
      <h2 className="text-xl font-bold text-black mb-4">Pengaturan Hero per Kategori Program</h2>
      <p className="text-gray-500 text-sm mb-6">Kelola judul, deskripsi, dan background Hero untuk setiap halaman spesifik (Slug).</p>

      {/* 1. MAPPING ACCORDION UNTUK SEMUA KATEGORI */}
      {categoryList.map((cat) => {
        const data = slugHeros[cat.key] || { title: "", subtitle: "", image: "" };
        
        return (
          <Accordion key={cat.key} title={cat.label}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={data.title}
                  onChange={(e) => handleHeroChange(cat.key, "title", e.target.value)}
                  className={inputClass} 
                  placeholder="Masukkan judul hero..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea 
                  rows="2" 
                  value={data.subtitle}
                  onChange={(e) => handleHeroChange(cat.key, "subtitle", e.target.value)}
                  className={inputClass} 
                  placeholder="Masukkan deskripsi hero..." 
                />
              </div>
              
              <UploadWithFigmaDesign 
                value={data.image} 
                onChange={(url) => handleHeroChange(cat.key, "image", url)} 
              />
            </div>
          </Accordion>
        );
      })}

      {/* 2. ACCORDION SPESIAL UNTUK HERO PAGE DETAIL (Paling Bawah) */}
      <div className="pt-6">
        <Accordion title="Hero Page Detail">
          <div className="space-y-6">
            <UploadWithFigmaDesign 
              value={slugHeros.detail?.image || ""} 
              onChange={(url) => handleDetailChange("image", url)} 
            />

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="blurCheckbox"
                checked={slugHeros.detail?.isBlur || false}
                onChange={(e) => handleDetailChange("isBlur", e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 accent-pink-600"
              />
              <label htmlFor="blurCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                Tampilkan Efek Blur pada Background
              </label>
            </div>
          </div>
        </Accordion>
      </div>

    </div>
  );
}
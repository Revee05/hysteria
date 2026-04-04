// components/adminUI/program-page/TabTampilanUtama.jsx
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

// ==============================================================
// UI UPLOAD TIPE 1: BOX TENGAH (Gambar Full Tidak Terpotong)
// ==============================================================
const UploadBoxFigma = ({ value, onChange, label, sizeText = "Size: 500 x 270px" }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative border-[1.5px] border-dashed border-gray-500 rounded-xl flex flex-col items-center justify-center py-8 px-4 text-center bg-[#EBEBEB] overflow-hidden group min-h-[220px]">
      {value ? (
        <>
          {/* UBAH DI SINI: object-cover jadi object-contain p-2 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 z-10" />
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              type="button"
              onClick={() => onChange("")} 
              className="text-white font-bold px-6 py-2.5 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors z-30 cursor-pointer shadow-md"
            >
              Hapus / Ubah Gambar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-pointer flex flex-col [&>*]:flex-1 [&>*]:w-full [&>*]:h-full [&_div]:w-full [&_div]:h-full">
            <ImageUpload value={value} onChange={onChange} />
          </div>
          <div className="z-0 absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
            <svg className="w-12 h-12 text-black mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16V8m0 0l-3 3m3-3l3 3"></path>
            </svg>
            <h3 className="text-[15px] font-extrabold text-black mb-1">Drag & Drop files here</h3>
            <p className="text-xs text-black mb-2">or <span className="underline">browse to upload</span></p>
            <p className="text-[10px] text-black mb-4">{sizeText}</p>
            <div className="px-8 py-1.5 bg-white border-[1.5px] border-[#E83C91] text-[#E83C91] font-bold text-sm rounded-lg shadow-sm">
              Upload
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

// ==============================================================
// UI UPLOAD TIPE 2: SIMETRIS 50:50 (Gambar Full Tidak Terpotong)
// ==============================================================
const UploadWithFigmaDesign = ({ value, onChange, label = "Upload Gambar", sizeText = "Size: 1920 x 850 px" }) => (
  <div className="pt-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="bg-[#EBEBEB] border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-stretch">
      {/* KIRI: Drag & Drop */}
      <div className="w-full md:w-1/2 relative border-[1.5px] border-dashed border-gray-500 rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center bg-transparent overflow-hidden group min-h-[240px]">
        <div className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-pointer flex flex-col [&>*]:flex-1 [&>*]:w-full [&>*]:h-full [&_div]:w-full [&_div]:h-full">
          <ImageUpload value={value} onChange={onChange} />
        </div>
        <div className="z-0 absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
          <svg className="w-14 h-14 text-black mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <h3 className="text-[17px] font-extrabold text-black mb-1">Drag & Drop files here</h3>
          <p className="text-sm text-black mb-3">or <span className="underline">browse to upload</span></p>
          <p className="text-xs text-black mb-5">{sizeText}</p>
          <div className="px-10 py-2.5 bg-white border-[1.5px] border-[#E83C91] text-[#E83C91] font-bold rounded-lg shadow-sm">
            Upload
          </div>
        </div>
      </div>
      {/* KANAN: Preview */}
      <div className="w-full md:w-1/2 min-h-[240px] border border-gray-400 rounded-xl bg-[#E2E2E2] flex items-center justify-center relative overflow-hidden group/preview">
        {value ? (
          <>
            {/* UBAH DI SINI JUGA: object-cover jadi object-contain p-2 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 shadow-inner" />
            <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
              <button 
                type="button"
                onClick={() => onChange("")} 
                className="text-white text-sm font-bold px-5 py-2 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors z-30 cursor-pointer shadow-md"
              >
                Hapus Gambar
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-black opacity-60">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm font-medium">[ Thumbnail Preview ]</span>
          </div>
        )}
      </div>
    </div>
  </div>
);


export default function TabTampilanUtama({ mainHero, setMainHero, covers, setCovers, podcasts, setPodcasts }) {
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-black placeholder-gray-400";

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ========================================== */}
      {/* 1. HERO PAGE PROGRAM HYSTERIA */}
      {/* ========================================== */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold text-black mb-5">Hero Page Program Hysteria</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline *</label>
            <input type="text" value={mainHero.headline || ""} onChange={(e) => setMainHero({ ...mainHero, headline: e.target.value })} className={inputClass} placeholder="Contoh: Laboratorium Perkotaan Semarang Kita" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Headline *</label>
            <textarea rows="3" value={mainHero.subHeadline || ""} onChange={(e) => setMainHero({ ...mainHero, subHeadline: e.target.value })} className={inputClass} placeholder="Tulis deskripsi program hysteria di sini..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tautan Hysteria (Opsional)</label>
            <input type="url" value={mainHero.tautan || ""} onChange={(e) => setMainHero({ ...mainHero, tautan: e.target.value })} className={inputClass} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <UploadBoxFigma label="Upload Gambar Kiri *" value={mainHero.gambarKiri || ""} onChange={(url) => setMainHero({ ...mainHero, gambarKiri: url })} sizeText="Size: 500 x 500px" />
            <UploadBoxFigma label="Upload Gambar Kanan *" value={mainHero.gambarKanan || ""} onChange={(url) => setMainHero({ ...mainHero, gambarKanan: url })} sizeText="Size: 500 x 500px" />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. ACCORDION COVER (GAMBAR SAJA) */}
      {/* ========================================== */}
      <div className="pt-2">
        <Accordion title="Cover Festival dan Pameran">
          <div className="space-y-6">
            <div className="w-full">
              <UploadBoxFigma 
                label="Upload Gambar Festival Kampung" 
                value={covers.festivalKampung || ""} 
                onChange={(url) => setCovers({ ...covers, festivalKampung: url })} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadBoxFigma 
                label="Upload Gambar Festival Kota" 
                value={covers.festivalKota || ""} 
                onChange={(url) => setCovers({ ...covers, festivalKota: url })} 
              />
              <UploadBoxFigma 
                label="Upload Gambar Biennale" 
                value={covers.biennale || ""} 
                onChange={(url) => setCovers({ ...covers, biennale: url })} 
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Cover Residensi dan Workshop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadBoxFigma label="Upload Gambar Flash Residency" value={covers.flashResidency || ""} onChange={(url) => setCovers({ ...covers, flashResidency: url })} />
            <UploadBoxFigma label="Upload Gambar Kandang Tandang" value={covers.kandangTandang || ""} onChange={(url) => setCovers({ ...covers, kandangTandang: url })} />
          </div>
        </Accordion>
      </div>

      {/* ========================================== */}
      {/* 3. ACCORDION PODCAST (TITLE, SUBTITLE, GAMBAR DENGAN LAYOUT 50:50) */}
      {/* ========================================== */}
      <div className="pt-2">
        <Accordion title="Cover Safari Memori">
          <div className="space-y-4">
            <h3 className="font-bold text-black mb-2">Hero Page Tentang Safari Memori</h3>
            <input type="text" value={podcasts.safariMemori?.title || ""} onChange={(e) => setPodcasts({ ...podcasts, safariMemori: { ...podcasts.safariMemori, title: e.target.value } })} className={inputClass} placeholder="Title" />
            <textarea rows="2" value={podcasts.safariMemori?.subtitle || ""} onChange={(e) => setPodcasts({ ...podcasts, safariMemori: { ...podcasts.safariMemori, subtitle: e.target.value } })} className={inputClass} placeholder="Subtitle" />
            {/* Menggunakan layout 50:50 */}
            <UploadWithFigmaDesign value={podcasts.safariMemori?.image || ""} onChange={(url) => setPodcasts({ ...podcasts, safariMemori: { ...podcasts.safariMemori, image: url } })} />
          </div>
        </Accordion>

        <Accordion title="Cover Aston">
          <div className="space-y-4">
            <h3 className="font-bold text-black mb-2">Hero Page Tentang Aston</h3>
            <input type="text" value={podcasts.aston?.title || ""} onChange={(e) => setPodcasts({ ...podcasts, aston: { ...podcasts.aston, title: e.target.value } })} className={inputClass} placeholder="Title" />
            <textarea rows="2" value={podcasts.aston?.subtitle || ""} onChange={(e) => setPodcasts({ ...podcasts, aston: { ...podcasts.aston, subtitle: e.target.value } })} className={inputClass} placeholder="Subtitle" />
            {/* Menggunakan layout 50:50 */}
            <UploadWithFigmaDesign value={podcasts.aston?.image || ""} onChange={(url) => setPodcasts({ ...podcasts, aston: { ...podcasts.aston, image: url } })} />
          </div>
        </Accordion>

        <Accordion title="Cover Sore Di Stonen">
          <div className="space-y-4">
            <h3 className="font-bold text-black mb-2">Hero Page Tentang Sore Di Stonen</h3>
            <input type="text" value={podcasts.soreDiStonen?.title || ""} onChange={(e) => setPodcasts({ ...podcasts, soreDiStonen: { ...podcasts.soreDiStonen, title: e.target.value } })} className={inputClass} placeholder="Title" />
            <textarea rows="2" value={podcasts.soreDiStonen?.subtitle || ""} onChange={(e) => setPodcasts({ ...podcasts, soreDiStonen: { ...podcasts.soreDiStonen, subtitle: e.target.value } })} className={inputClass} placeholder="Subtitle" />
            {/* Menggunakan layout 50:50 */}
            <UploadWithFigmaDesign value={podcasts.soreDiStonen?.image || ""} onChange={(url) => setPodcasts({ ...podcasts, soreDiStonen: { ...podcasts.soreDiStonen, image: url } })} />
          </div>
        </Accordion>
      </div>

      {/* ========================================== */}
      {/* 4. ACCORDION COVER VIDEO SERIES (Pindah ke Paling Bawah) */}
      {/* ========================================== */}
      <div className="pt-2">
        <Accordion title="Cover Video Series">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadBoxFigma label="Upload Gambar Sapa Warga" value={covers.sapaWarga || ""} onChange={(url) => setCovers({ ...covers, sapaWarga: url })} />
            <UploadBoxFigma label="Upload Gambar Hysteria Berkelana" value={covers.hysteriaBerkelana || ""} onChange={(url) => setCovers({ ...covers, hysteriaBerkelana: url })} />
          </div>
        </Accordion>
      </div>

    </div>
  );
}
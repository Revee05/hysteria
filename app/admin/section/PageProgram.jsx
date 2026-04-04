// app/admin/section/PageProgram.jsx
"use client";

import { useState, useEffect } from "react";
import TabTampilanUtama from "@/components/adminUI/program-page/TabTampilanUtama";
import TabBagianHero from "@/components/adminUI/program-page/TabBagianHero";

export default function PageProgram() {
  const [activeTab, setActiveTab] = useState("utama"); // "utama" atau "hero"
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ================= STATE TAB 1 =================
  const [mainHero, setMainHero] = useState({ headline: "", subHeadline: "", tautan: "", gambarKiri: "", gambarKanan: "" });
  const [covers, setCovers] = useState({ festivalKampung: "", festivalKota: "", biennale: "", flashResidency: "", kandangTandang: "", sapaWarga: "", hysteriaBerkelana: "" });
  const [podcasts, setPodcasts] = useState({ safariMemori: { title: "", subtitle: "", image: "" }, aston: { title: "", subtitle: "", image: "" }, soreDiStonen: { title: "", subtitle: "", image: "" } });

  // ================= STATE TAB 2 =================
  const [slugHeros, setSlugHeros] = useState({});

  // ==============================================================
  // 1. LOAD DATA DARI DATABASE SAAT HALAMAN DIBUKA (GET)
  // ==============================================================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // 👇 UBAH DI SINI: Menjadi /page-program
        const res = await fetch("/api/admin/page-program");
        if (res.ok) {
          const data = await res.json();
          
          // Isi state dengan data dari database (kalau ada)
          if (data.mainHero) setMainHero(data.mainHero);
          if (data.slugHeros) setSlugHeros(data.slugHeros);
          
          // Ekstrak data covers dan podcasts (karena kita titipkan podcasts di dalam covers)
          if (data.covers) {
            const { podcasts: dbPodcasts, ...dbCovers } = data.covers;
            if (Object.keys(dbCovers).length > 0) setCovers(dbCovers);
            if (dbPodcasts) setPodcasts(dbPodcasts);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data pengaturan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ==============================================================
  // 2. SIMPAN DATA KE DATABASE SAAT TOMBOL DIKLIK (POST)
  // ==============================================================
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Bungkus data sesuai struktur kolom Prisma
      const payload = {
        mainHero,
        covers: {
          ...covers,
          podcasts: podcasts // 👈 Kita masukkan podcast ke dalam kolom JSON covers
        },
        slugHeros,
      };

      // 👇 UBAH DI SINI JUGA: Menjadi /page-program
      const res = await fetch("/api/admin/page-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan ke server");
      }

      alert("🎉 Pengaturan berhasil disimpan ke Database!");
    } catch (error) {
      alert("❌ Terjadi kesalahan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Tampilan loading sebelum data beres diambil dari DB
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] text-[#E83C91]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E83C91] mb-3"></div>
        <p className="font-semibold font-poppins text-sm animate-pulse">Menyinkronkan dengan Database...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-5xl mx-auto font-poppins">
      {/* HEADER & TOMBOL SIMPAN */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Hero Page Program</h1>
          <p className="text-sm text-gray-500">Kelola bagian Hero dan tampilan utama pada bagian Program Hysteria.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#413153] hover:bg-[#2d2239] text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-8 mb-8 border-b">
        <button
          onClick={() => setActiveTab("utama")}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "utama" ? "text-[#E83C91]" : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Tampilan Utama Program
          {activeTab === "utama" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E83C91]" />}
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "hero" ? "text-[#E83C91]" : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Bagian Hero
          {activeTab === "hero" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E83C91]" />}
        </button>
      </div>

      {/* RENDER KOMPONEN SECTION */}
      <div className="mt-4">
        {activeTab === "utama" ? (
          <TabTampilanUtama 
            mainHero={mainHero} setMainHero={setMainHero}
            covers={covers} setCovers={setCovers}
            podcasts={podcasts} setPodcasts={setPodcasts}
          />
        ) : (
          <TabBagianHero 
            slugHeros={slugHeros} setSlugHeros={setSlugHeros}
          />
        )}
      </div>
    </div>
  );
}
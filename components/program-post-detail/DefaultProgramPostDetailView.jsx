"use client";

import { ArrowLeft, ArrowRight, Instagram, Facebook, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DefaultProgramPostDetailView({ slug, id }) {
  const router = useRouter();

  // Data Dummy agar sesuai dengan gambar UI
  const dummyData = {
    title: "Buah Tangan #47: Di Korea Mung Pindah Turu Tok!",
    subCategories: ["Buah Tangan", "Pemilu & Laba"],
    organizers: ["Hysteria", "Ditampart", "Peka Kota"],
    status: "Akan Berlangsung",
    date: "15 Juli 2025",
    time: "19.00 WIB - Selesai",
    locationName: "Rumah Pk Han",
    locationAddress: "Jl. Kepodang, Semarang",
    poster: "https://via.placeholder.com/400x500?text=Poster+Acara", // Ganti dengan path gambarmu nanti
    inlineImage: "https://via.placeholder.com/600x600?text=Dokumentasi+Acara",
  };

  return (
    <div className="min-h-screen bg-white font-poppins pb-20">
      
      {/* BACKGROUND PINK GRADIENT (Bagian Atas) */}
      <div className="w-full h-[280px] bg-gradient-to-br from-[#E83C91] via-[#d6287c] to-[#a31a5c] relative z-0">
        <div className="absolute inset-0 bg-black/10"></div> {/* Sedikit overlay gelap biar teks putih kebaca */}
      </div>

      {/* KONTEN UTAMA (Overlap ke atas background pink) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 -mt-[200px] flex flex-col md:flex-row gap-12">
        
        {/* =======================================================
            KOLOM KIRI (Sidebar) 
            ======================================================= */}
        <div className="w-full md:w-[320px] shrink-0">
          
          {/* Tombol Back */}
          <button 
            onClick={() => router.back()} 
            className="text-white hover:text-gray-200 transition-colors mb-6 flex items-center"
          >
            <ArrowLeft size={28} />
          </button>

          {/* Gambar Poster */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
            <img 
              src={dummyData.poster} 
              alt="Poster Acara" 
              className="w-full h-auto object-cover aspect-[4/5]"
            />
          </div>

          {/* Info Sidebar (Putih, Teks Hitam) */}
          <div className="space-y-6">
            {/* Keseruan Kami */}
            <div>
              <h3 className="font-bold text-lg text-black mb-3">Ikuti Keseruan Kami</h3>
              <button className="bg-[#E83C91] hover:bg-[#c22e75] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Daftar Sekarang
              </button>
            </div>

            {/* Jadwal Pelaksanaan */}
            <div>
              <h3 className="font-bold text-lg text-black mb-3">Jadwal Pelaksanaan</h3>
              <table className="text-sm text-black">
                <tbody>
                  <tr>
                    <td className="pr-4 py-1">Tanggal Acara</td>
                    <td>: {dummyData.date}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1">Waktu Acara</td>
                    <td>: {dummyData.time}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Lokasi */}
            <div>
              <h3 className="font-bold text-lg text-black mb-3">Lokasi</h3>
              <p className="text-sm text-black mb-3 leading-relaxed">
                {dummyData.locationName} <br />
                {dummyData.locationAddress}
              </p>
              <button className="border-2 border-[#E83C91] text-[#E83C91] hover:bg-pink-50 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Lacak Lokasi
              </button>
            </div>

            {/* Arsip Kegiatan */}
            <div>
              <h3 className="font-bold text-lg text-black mb-3">Arsip Kegiatan</h3>
              <div className="flex flex-col gap-3 items-start">
                <button className="border-2 border-[#E83C91] text-[#E83C91] hover:bg-pink-50 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Dokumentasi
                </button>
                <button className="border-2 border-[#E83C91] text-[#E83C91] hover:bg-pink-50 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Youtube
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* =======================================================
            KOLOM KANAN (Konten Deskripsi)
            ======================================================= */}
        <div className="flex-1 md:pt-[240px]"> 
          {/* Teks Sub Kategori */}
          <div className="flex flex-wrap gap-2 mb-4">
            {dummyData.subCategories.map((sub, idx) => (
              <span key={idx} className="border border-[#E83C91] text-[#E83C91] px-3 py-1 rounded-full text-xs font-semibold">
                {sub}
              </span>
            ))}
          </div>

          {/* Judul Acara */}
          <h1 className="text-3xl md:text-4xl font-bold text-black leading-snug mb-6">
            {dummyData.title}
          </h1>

          {/* Info Penyelenggara & Status */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-black font-medium">Diselenggarakan oleh :</span>
              <div className="flex gap-2">
                {dummyData.organizers.map((org, idx) => (
                  <span key={idx} className="bg-[#E83C91] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {org}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-black font-medium">Status Event :</span>
              <span className="border border-[#E83C91] text-[#E83C91] px-3 py-1 rounded-full text-xs font-semibold">
                {dummyData.status}
              </span>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="text-black space-y-6">
            <h2 className="text-2xl font-bold mb-4">Deskripsi</h2>
            <p className="text-sm leading-relaxed">
              Buah Tangan #47: Di Korea Mung Pindah Turu Tok! <br />
              Apa benar di Korea cuma pindah tempat tidur aja? Yuk, dengar cerita langsung dari teman-teman Kolektif Hysteria yang baru pulang dari Korea Selatan!
            </p>

            {/* Gambar Inline dalam Deskripsi */}
            <img src={dummyData.inlineImage} alt="Inline Content" className="w-full max-w-xl rounded-xl shadow-sm my-6" />

            <p className="text-sm leading-relaxed">
              Obrolan seru akan dipandu oleh: <br />
              <strong>Adin, Kupang, Purna, dan Yuz (Kolektif Hysteria)</strong>
            </p>

            <p className="text-sm leading-relaxed text-[#E83C91]">
              <strong>Tag:</strong> #BuahTanganHysteria #PemiluDanLaba #Hysteria20Tahun #OlehOlehDariKorea
            </p>
          </div>

          {/* Share Social Media */}
          <div className="mt-8 flex items-center gap-4 text-black">
            <span className="font-bold text-sm">Share:</span>
            <Instagram className="cursor-pointer hover:text-[#E83C91] transition-colors" size={20} />
            <Facebook className="cursor-pointer hover:text-[#E83C91] transition-colors" size={20} />
            <Twitter className="cursor-pointer hover:text-[#E83C91] transition-colors" size={20} />
          </div>
        </div>
      </div>

      {/* =======================================================
          SECTION BAWAH: EVENT LAINNYA
          ======================================================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Event lainnya</h2>
          <button className="w-10 h-10 border border-[#E83C91] rounded-full flex items-center justify-center text-[#E83C91] hover:bg-pink-50 transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Grid Card Event Lainnya (Dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-gray-200 rounded-xl aspect-[4/5] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group">
              <img src={dummyData.poster} className="w-full h-full object-cover" alt="Other event" />
              {/* Overlay Hover Effect (Opsional) */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[#E83C91] text-white px-4 py-2 rounded-lg text-xs font-semibold">Lihat Detail</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
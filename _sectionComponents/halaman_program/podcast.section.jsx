// _components/halaman_program/PodcastSection.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], 
});

// MENERIMA PROPS "podcasts" DARI PAGE INDUK
export default function PodcastSection({ podcasts }) {
  // 1. STATE AWAL KOSONG MELOMPONG (Murni nunggu Admin)
  const [podcastLinks, setPodcastLinks] = useState({
    aston: "",
    soreDiStonen: "",
  });

  // 2. FETCH DATA DARI API PODCAST (Tetap dipertahankan karena sudah jalan)
  useEffect(() => {
    async function fetchPodcastData() {
      try {
        const res = await fetch("/api/admin/programs/podcast");
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setPodcastLinks({
              aston: data.astonLink || "",
              soreDiStonen: data.soreDiStonenLink || "",
            });
          }
        }
      } catch (error) {
        console.error("Gagal mengambil link podcast:", error);
      }
    }
    fetchPodcastData();
  }, []);

  // 3. GABUNGKAN DATA VISUAL (DARI PROPS) DENGAN LINK DARI STATE
  const PODCAST_ITEMS = [
    {
      id: 1,
      title: podcasts?.safariMemori?.title || "Safari Memori",
      desc: podcasts?.safariMemori?.subtitle || "Podcast tentang arsip, nostalgia, dan penelusuran jejak",
      image: podcasts?.safariMemori?.image || "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop",
      link: "/program/safari-memori", // Ini tetap statis karena ini adalah halaman internal website
    },
    {
      id: 2,
      title: podcasts?.aston?.title || "Aston",
      desc: podcasts?.aston?.subtitle || "Podcast tentang perspektif personal anak stonen dalam membahas isu sosial",
      image: podcasts?.aston?.image || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
      link: podcastLinks.aston, // 100% dari Database API
    },
    {
      id: 3,
      title: podcasts?.soreDiStonen?.title || "Sore di Stonen",
      desc: podcasts?.soreDiStonen?.subtitle || "Podcast yang berfokus pada suasana ngobrol yang santai dan reflektif",
      image: podcasts?.soreDiStonen?.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop",
      link: podcastLinks.soreDiStonen, // 100% dari Database API
    },
  ];

  return (
    <section id="podcast" className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 mb-20">
      
      {/* JUDUL SECTION */}
      <h2 className={`${poppins.className} text-[28px] md:text-[32px] font-bold text-black mb-8`}>
        Podcast
      </h2>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {PODCAST_ITEMS.map((item) => {
          // Pengecekan apakah link valid dan eksternal
          const hasLink = Boolean(item.link);
          const isExternalLink = hasLink && item.link.startsWith("http");
          // Kalau link kosong, arahkan ke "#" agar tidak error
          const hrefTarget = hasLink ? item.link : "#"; 

          return (
            <Link
              href={hrefTarget}
              key={item.id}
              target={isExternalLink ? "_blank" : "_self"}
              rel={isExternalLink ? "noopener noreferrer" : ""}
              // Mencegah klik jika Admin belum mengisi link
              onClick={(e) => {
                if (!hasLink) {
                  e.preventDefault();
                  alert("Link podcast ini belum diperbarui oleh Admin.");
                }
              }}
              className="group bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col"
            >
              {/* BAGIAN GAMBAR */}
              <div className="relative w-full h-[220px] bg-gray-200 overflow-hidden">
                 <Image 
                   src={item.image} 
                   alt={item.title} 
                   fill 
                   className="object-cover group-hover:scale-105 transition-transform duration-700" 
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* BAGIAN KONTEN */}
              <div className="p-8 text-center flex flex-col items-center justify-center flex-grow min-h-[180px]">
                <h3 className={`${poppins.className} text-[#D63384] text-xl font-bold mb-3`}>
                  {item.title}
                </h3>

                <p className={`${poppins.className} text-[#D63384] text-sm leading-relaxed max-w-[280px] font-normal`}>
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
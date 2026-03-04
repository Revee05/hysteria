// _components/VideoSeriesSection.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Data Dummy Video Series
const VIDEO_ITEMS = [
  {
    id: 1,
    title: "Sapa Warga",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop",
    // UBAH: Langsung mengarah ke slug-nya
    link: "/program/sapa-warga"
  },
  {
    id: 2,
    title: "Hysteria Berkelana",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop",
    // UBAH: Langsung mengarah ke slug-nya
    link: "/program/hysteria-berkelana"
  },
];

export default function VideoSeriesSection() {
  return (
    <section id="video-series" className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 mb-20">
      
      {/* JUDUL SECTION */}
      <h2
        className={`${poppins.className} text-[28px] md:text-[32px] font-bold text-black mb-8`}
      >
        Video Series
      </h2>

      {/* GRID LAYOUT (2 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {VIDEO_ITEMS.map((item) => (
          <Link
            href={item.link}
            key={item.id}
            className="block group relative w-full h-[300px] md:h-[380px] rounded-[24px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
          >
            {/* 1. BACKGROUND IMAGE */}
            <div className="absolute inset-0 bg-gray-800">
               <Image 
                 src={item.image} 
                 alt={item.title} 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100" 
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
               
               {/* Play Icon Overlay (Efek Pop-up) */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 z-10">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/40 transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-lg">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
               </div>
            </div>

            {/* 2. FOOTER BAR (Judul & Panah) */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#3E3245] p-6 md:p-8 flex items-center justify-between transition-colors duration-300 group-hover:bg-[#5a4863] z-20">
              
              {/* Judul */}
              <h3 className={`${poppins.className} text-white text-xl md:text-2xl font-bold`}>
                {item.title}
              </h3>

              {/* Ikon Panah Kanan */}
              <div className="bg-white/10 p-2 rounded-full text-white transform group-hover:translate-x-2 group-hover:bg-white/20 transition-all duration-300">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

// DATA MUSIK (Disesuaikan dengan struktur Forum)
const MUSIC_ITEMS = [
  // ... (Data Musik tetap sama) ...
  { 
    id: 1, 
    title: "SGRT",
    subTitle: "Album Rilisan Terbaru",
    genre: "Indie Pop",
    date: "Rilis: 2024",
    status: "New Release",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 2, 
    title: "Kotak Listrik",
    subTitle: "Eksperimental Elektronik",
    genre: "Synthwave",
    date: "Rilis: 2023",
    status: "Featured",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 3, 
    title: "Di(e)gital",
    subTitle: "Suara Masa Depan",
    genre: "Cyberpunk",
    date: "Rilis: 2025",
    status: "Coming Soon",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 4, 
    title: "Bunyi Halaman Belakang",
    subTitle: "Sesi Akustik Santai",
    genre: "Folk / Acoustic",
    date: "Live Session",
    status: "Popular",
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 5, 
    title: "Folk Me Up",
    subTitle: "Kompilasi Musik Rakyat",
    genre: "Traditional Folk",
    date: "Rilis: 2022",
    status: "Classic",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80" 
  },
];

export default function MusicSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // State untuk Dragging
  const scrollRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // --- Logic Mouse Drag (Sama Persis dengan ForumSection) ---
  const handleMouseDown = (e) => {
    setIsDown(true);
    if(scrollRef.current) {
        scrollRef.current.style.scrollBehavior = 'auto'; 
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    if(scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseUp = () => {
    setIsDown(false);
    if(scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    if(scrollRef.current) {
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; 
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // --- Logic Sync Dots ---
  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const scrollPos = scrollRef.current.scrollLeft;
      const firstCard = scrollRef.current.children[0];
      const itemWidth = firstCard ? firstCard.clientWidth : 300; 
      const totalItemWidth = itemWidth + 24; 
      
      const index = Math.round(scrollPos / totalItemWidth);
      setActiveIndex(index);
    }
  };

  const scrollToSlide = (index) => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const firstCard = scrollRef.current.children[0];
      const itemWidth = firstCard ? firstCard.clientWidth : 300;
      const gap = 24; 
      
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.scrollTo({
        left: (itemWidth + gap) * index,
      });
      setActiveIndex(index);
    }
  };

  return (
    <section id="music" className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 mb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className={`${poppins.className} text-[28px] md:text-[32px] font-bold text-black mb-4 md:mb-0`}>
          Musik
        </h2>
        
        {/* LINK DIPERBARUI: Dihilangkan "-all" */}
        <Link 
            href="/program/music" 
            className="text-black font-semibold underline underline-offset-4 hover:text-[#D63384] transition"
        >
            Lihat Semua
        </Link>
      </div>
      
      {/* Slider Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
        className={`flex gap-6 overflow-x-auto pb-12 pt-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 overscroll-x-none touch-pan-y
          ${isDown ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'} 
        `}
        style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            overscrollBehaviorX: 'none'
        }} 
      >
        {MUSIC_ITEMS.map((item) => (
          <div 
            key={item.id} 
            // UKURAN DAN ASPEK RASIO SAMA DENGAN FORUM (4:5)
            className="flex-shrink-0 group relative w-[300px] sm:w-[340px] aspect-[4/5] snap-start rounded-xl overflow-hidden shadow-lg transition-all duration-300 select-none hover:shadow-2xl bg-gray-100"
          >
            {/* Background Image Layer */}
            <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                sizes="(max-width: 768px) 300px, 340px"
            />

            {/* Default Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

            {/* Default Content (Tampil saat tidak di-hover) */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
               <h3 className="text-2xl font-black leading-tight uppercase mb-2 drop-shadow-lg line-clamp-2">
                   {item.title}
               </h3>
               <div className="flex items-center gap-2 opacity-90 text-xs">
                   <span>🎵 {item.genre}</span>
               </div>
            </div>
            
            {/* Hover Overlay (Tampil saat di-hover) */}
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10 h-full p-6 flex flex-col justify-end items-start text-left">
                    <div className="mb-3">
                       {/* Badge Status */}
                       <span className="bg-white text-[#D63384] text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-block">
                          {item.status}
                       </span>
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-md">
                        {item.title}
                    </h3>
                    <p className="text-white font-bold text-sm mb-1 drop-shadow-md">
                        -{item.subTitle}-
                    </p>
                    <p className="text-gray-200 text-xs font-medium mb-4">
                        {item.date}
                    </p>
                    
                    {/* LINK DIPERBARUI: Dihilangkan "-all" */}
                    <Link 
                        href="/program/music"
                        className="bg-[#D63384] hover:bg-[#b02a6b] text-white text-sm font-semibold py-2.5 px-6 rounded-lg w-fit transition-colors shadow-lg inline-block"
                    >
                        Ikuti Sekarang
                    </Link>
                </div>
            </div>
          </div>
        ))}
        
        {/* Spacer */}
        <div className="flex-shrink-0 w-4 md:w-[calc(100%-360px)]" />
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-4 mt-8 h-6">
        {MUSIC_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`rounded-full transition-all duration-300 flex-shrink-0
              ${activeIndex === index 
                ? "w-4 h-4 bg-[#D63384] opacity-100" 
                : "w-2 h-2 bg-[#D63384] opacity-40 hover:opacity-100" 
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
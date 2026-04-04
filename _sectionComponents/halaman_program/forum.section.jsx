"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const DATA_POSTINGAN = [
  // ... (Data Postingan tetap sama) ...
  {
    id: 1,
    title: "DI KOREA MUNG PINDAH TURU TOK!",
    subTitle: "Buah Tangan dari Korsel",
    eventNumber: "Buah Tangan #47",
    date: "Sabtu, 8 Maret 2026",
    time: "19:00 WIB s.d. Selesai",
    location: "Jl. Stonen No.29 Gajahmungkur",
    status: "Akan Berlangsung",
    collab: ["Adin", "Puma", "Yus", "Kolektif Hysteria"],
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "MEMBACA ARSIP KOTA LAMA",
    subTitle: "Diskusi Sejarah",
    eventNumber: "Temu Jejaring #12",
    date: "Minggu, 9 Maret 2026",
    time: "15:00 WIB s.d. Selesai",
    location: "Gedung Oudetrap, Kota Lama",
    status: "Akan Berlangsung",
    collab: ["Arsip Kota", "Sejarawan Muda"],
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "MEDITASI DI TENGAH KEBISINGAN",
    subTitle: "Urban Healing",
    eventNumber: "Meditasi #05",
    date: "Senin, 10 Maret 2026",
    time: "08:00 WIB s.d. Selesai",
    location: "Taman Indonesia Kaya",
    status: "Selesai",
    collab: ["Guru Yoga", "Komunitas Peace"],
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    title: "SIMPOSIUM SENI & TEKNOLOGI",
    subTitle: "Masa Depan AI",
    eventNumber: "Simposium #08",
    date: "Selasa, 11 Maret 2026",
    time: "10:00 WIB s.d. Selesai",
    location: "Galeri Semarang",
    status: "Akan Berlangsung",
    collab: ["AI Labs", "Seniman Digital"],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    title: "JALAN JALAN SORE",
    subTitle: "Lawatan Santai",
    eventNumber: "Lawatan #20",
    date: "Rabu, 12 Maret 2026",
    time: "16:00 WIB s.d. Selesai",
    location: "Simpang Lima",
    status: "Akan Berlangsung",
    collab: ["Komunitas Jalan", "Pejalan Kaki"],
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ForumSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // State untuk Dragging
  const scrollRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // --- Logic Mouse Drag ---
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
    <section id="forum" className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 mb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className={`${poppins.className} text-[28px] md:text-[32px] font-bold text-black mb-4 md:mb-0`}>
          Forum
        </h2>
        
        {/* LINK DIPERBARUI: Dihilangkan "-all" */}
        <Link 
            href="/program/forum" 
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
        {DATA_POSTINGAN.map((post) => (
          <div 
            key={post.id} 
            className="flex-shrink-0 group relative w-[300px] sm:w-[340px] aspect-[4/5] snap-start rounded-xl overflow-hidden shadow-lg transition-all duration-300 select-none hover:shadow-2xl bg-gray-100"
          >
            {/* Background Image Layer */}
            <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                sizes="(max-width: 768px) 300px, 340px"
            />

            {/* Default Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

            {/* Default Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
               <h3 className="text-2xl font-black leading-tight uppercase mb-2 drop-shadow-lg line-clamp-2">
                   {post.title}
               </h3>
               <div className="flex items-center gap-2 opacity-90 text-xs">
                   <span>📍 {post.location}</span>
               </div>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10 h-full p-6 flex flex-col justify-end items-start text-left">
                    <div className="mb-3">
                       <span className="bg-white text-[#D63384] text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-block">
                          {post.status}
                       </span>
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-md">
                        {post.title}
                    </h3>
                    <p className="text-white font-bold text-sm mb-1 drop-shadow-md">
                        -{post.subTitle}-
                    </p>
                    <p className="text-gray-200 text-xs font-medium mb-4">
                        {post.date}
                    </p>
                    
                    {/* LINK DIPERBARUI: Dihilangkan "-all" */}
                    <Link 
                        href="/program/forum"
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
        {DATA_POSTINGAN.map((_, index) => (
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
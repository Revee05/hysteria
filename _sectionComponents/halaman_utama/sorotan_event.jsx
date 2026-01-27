"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dummy event data
const dummyEvents = [
  {
    id: 1,
    title: "Kembali Ke Semula - 10 Years Anniversary Vinocara Collective",
    date: "Sabtu, 8 Maret 2025",
    isoDate: "2025-03-08",
    location: "Balai Sarbini, Jakarta",
    category: "Konser Musik",
    description:
      "Perayaan 10 tahun perjalanan Vinocara Collective dengan deretan musisi terbaik Indonesia",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Bin Idris Dishala Musikha Dzaqiqa",
    date: "Jumat, 14 Maret 2025",
    isoDate: "2025-03-14",
    location: "GOR Saparua, Bandung",
    category: "Konser Musik",
    description:
      "Konser spektakuler dari Bin Idris dengan nuansa musik tradisional kontemporer",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Jazz Night Under The Stars",
    date: "Minggu, 20 Maret 2025",
    isoDate: "2025-03-20",
    location: "Taman Budaya, Yogyakarta",
    category: "Festival Jazz",
    description:
      "Nikmati malam penuh jazz dengan pemandangan bintang dan musisi jazz terbaik",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Indie Music Festival 2025",
    date: "Sabtu, 27 Maret 2025",
    isoDate: "2025-03-27",
    location: "Lapangan Banteng, Jakarta",
    category: "Festival Musik",
    description:
      "Festival musik indie terbesar dengan puluhan band dan musisi indie Indonesia",
    image: "https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Rock Revolution Concert",
    date: "Jumat, 3 April 2025",
    isoDate: "2025-04-03",
    location: "ICE BSD, Tangerang",
    category: "Konser Rock",
    description:
      "Malam penuh energi rock dengan band-band legendaris dan bintang tamu spesial",
    image: "https://images.unsplash.com/photo-1507862795369-8e2f3d2a7d9e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "Acoustic Vibes Sessions",
    date: "Minggu, 10 April 2025",
    isoDate: "2025-04-10",
    location: "Taman Ismail Marzuki, Jakarta",
    category: "Konser Akustik",
    description:
      "Sesi musik akustik intim dengan musisi-musisi berbakat dalam suasana santai",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=900&q=80",
  },
];

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }) => (
  <button
    type="button"
    aria-label="Sebelumnya"
    onClick={onClick}
    className="hidden sm:block absolute -left-2.5 md:-left-5 top-1/2 -translate-y-1/2 z-[2] bg-white/10 backdrop-blur-[10px] border border-white/20 w-[35px] md:w-[45px] h-[35px] md:h-[45px] hover:bg-white/20 text-[#43334c] rounded-full transition-all"
  >
    <svg className="w-6 h-6 md:w-7 md:h-7 mx-auto" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    type="button"
    aria-label="Selanjutnya"
    onClick={onClick}
    className="hidden sm:block absolute -right-2.5 md:-right-5 top-1/2 -translate-y-1/2 z-[2] bg-white/10 backdrop-blur-[10px] border border-white/20 w-[35px] md:w-[45px] h-[35px] md:h-[45px] hover:bg-white/20 text-[#43334c] rounded-full transition-all"
  >
    <svg className="w-6 h-6 md:w-7 md:h-7 mx-auto" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  </button>
);

export default function SorotanEvent() {
  const sliderRef = useRef(null);
  const [slidesToShow, setSlidesToShow] = useState(5);
  const [activeId, setActiveId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const calc = (w) => {
      if (w >= 1280) return 5;
      if (w >= 1024) return 4;
      if (w >= 960) return 3;
      if (w >= 768) return 2;
      if (w >= 600) return 2;
      return 2; // mobile: show 2 cards for better proportions
    };

    const update = () => setSlidesToShow(calc(window.innerWidth));
    if (typeof window !== "undefined") {
      update();
      window.addEventListener("resize", update);
    }
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("resize", update);
    };
  }, []);

  // close overlay when clicking outside carousel
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setActiveId(null);
    };
    if (typeof window !== "undefined") {
      document.addEventListener("click", handler);
    }
    return () => {
      if (typeof window !== "undefined") document.removeEventListener("click", handler);
    };
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: false,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    beforeChange: () => setActiveId(null),
    onSwipe: () => setActiveId(null),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section 
    // className="bg-[#FFFFFF] py-8 mb-20 mt-20 relative overflow-visible border border-zinc-900" 
    className="bg-[#FFFFFF] py-8 mb-20 mt-20 relative overflow-visible" 
    aria-labelledby="sorotan-title">
      <div className="max-w-[1920px] w-full mx-auto px-2 sm:px-2">
        {/* Section Title */}
        <header className="text-center mb-6" role="banner">
          <h2 id="sorotan-title" className="text-#000000 font-bold text-[1.75rem] md:text-[2.5rem] mb-2">
            Sorotan Event
          </h2>
          <p className="text-#626262 text-[0.9rem] md:text-base max-w-[600px] mx-auto mb-10">
            Deretan event terbaik dan paling menarik untuk diikuti!
          </p>
        </header>

        {/* Style, ukuran Carousel */}
        <div className="relative px-2 md:px-7 pt-2 overflow-visible rounded-xl" ref={containerRef} role="region" aria-label="Sorotan Event">
          <Slider ref={sliderRef} {...settings}>
            {dummyEvents.map((event) => (
              // ruang area penyusun urutan card
              <div key={event.id} className="px-2 md:px-1.5 pt-4 pb-4 mt-0 md:mt-0">
                <article
                  tabIndex={0}
                  role="button"
                  onClick={() => setActiveId(activeId === event.id ? null : event.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId(activeId === event.id ? null : event.id);
                    }
                    if (e.key === "Escape") setActiveId(null);
                  }}
                  aria-expanded={activeId === event.id}
                  aria-labelledby={`event-title-${event.id}`}
                  className="relative rounded-xl overflow-hidden h-[240px] sm:h-[300px] md:h-[450px] bg-[#18181b]/50 border border-white/10 cursor-pointer transform transition-all duration-300 ease-in-out hover:-translate-y-3 md:hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:z-20 group"
                >
                  {/* ukuran Image/Poster di dalam card*/}
                  <figure className="relative w-full h-full">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      onError={(e) => {
                        // Fallback for missing images: replace underlying img src if available
                        if (e?.target) {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="450"%3E%3Crect width="400" height="450" fill="%23433346"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23ffffff"%3E' +
                            encodeURIComponent(event.category) +
                            "%3C/text%3E%3C/svg%3E";
                        }
                      }}
                      unoptimized
                    />
                  </figure>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-40 bg-blue-500/90 text-white px-2 py-0.5 rounded-[20px] text-xs font-semibold backdrop-blur-[10px]">
                    {event.category}
                  </div>

                  {/* Hover Overlay (covers whole card) */}
                  <figcaption className={`event-overlay absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-2 sm:p-3 transition-opacity duration-300 ease-in-out flex flex-col justify-end ${activeId === event.id ? "opacity-100" : "opacity-0"} group-hover:opacity-100`}>
                    <h6 id={`event-title-${event.id}`} className="text-white font-bold text-sm md:text-[1.1rem] mb-1 leading-tight">
                      {event.title}
                    </h6>
                    <time dateTime={event.isoDate} className="text-white/80 text-[0.72rem] md:text-[0.85rem] mb-0.5">
                      📅 {event.date}
                    </time>
                    <p className="text-white/80 text-[0.72rem] md:text-[0.85rem] mb-2">
                      📍 {event.location}
                    </p>
                    <button type="button" onClick={(e)=>e.stopPropagation()} aria-label={`Ikuti ${event.title} sekarang`} className="bg-[#7c3aed] text-white font-semibold text-xs sm:text-sm py-1 rounded-lg hover:bg-[#6d28d9] transition-colors">
                      Ikuti Sekarang
                    </button>
                  </figcaption>
                </article>
              </div>
            ))}
          </Slider>
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center mt-6">
          <a
            href="/event"
            className="bg-[#43334C] inline-block text-white border border-[#43334C] font-semibold text-base px-4 py-1.5 rounded-lg hover:border-[#7c3aed] hover:bg-[#7c3aed]/20 hover:text-[#7c3aed] transition-all"
          >
            Lihat Event Lainnya
          </a>
        </div>
      </div>
    </section>
  );
}

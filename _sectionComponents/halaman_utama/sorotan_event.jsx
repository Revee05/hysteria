"use client";

/**
 * ================================
 * IMPORTS
 * ================================
 * - React hooks untuk state & lifecycle
 * - Next.js components (Image, Link)
 * - react-slick untuk carousel
 * - slick styles
 */
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * ================================
 * CUSTOM ARROW: PREVIOUS
 * ================================
 * Tombol navigasi ke slide sebelumnya
 * - Hidden di mobile (sm ke atas baru muncul)
 * - Position absolute di kiri carousel
 */
const CustomPrevArrow = ({ onClick }) => (
  <button
    type="button"
    aria-label="Sebelumnya"
    onClick={onClick}
    className="cursor-pointer hidden sm:block absolute -left-2.5 md:-left-5 top-1/2 -translate-y-1/2 z-2 bg-white/10 backdrop-blur-[10px] border border-white/20 w-[35px] md:w-[45px] h-[35px] md:h-[45px] hover:bg-white/20 text-[#43334c] rounded-full transition-all"
  >
    {/* Icon panah kiri */}
    <svg
      className="w-6 h-6 md:w-7 md:h-7 mx-auto"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  </button>
);

/**
 * ================================
 * CUSTOM ARROW: NEXT
 * ================================
 * Tombol navigasi ke slide berikutnya
 * - Mirroring dari prev arrow
 */
const CustomNextArrow = ({ onClick }) => (
  <button
    type="button"
    aria-label="Selanjutnya"
    onClick={onClick}
    className="cursor-pointer hidden sm:block absolute -right-2.5 md:-right-5 top-1/2 -translate-y-1/2 z-2 bg-white/10 backdrop-blur-[10px] border border-white/20 w-[35px] md:w-[45px] h-[35px] md:h-[45px] hover:bg-white/20 text-[#43334c] rounded-full transition-all"
  >
    {/* Icon panah kanan */}
    <svg
      className="w-6 h-6 md:w-7 md:h-7 mx-auto"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  </button>
);

/**
 * ================================
 * FORMAT DATE HELPER
 * ================================
 * Mengubah date string ke format Indonesia:
 * Contoh: "Senin, 1 Januari 2025"
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * ================================
 * MAIN COMPONENT: SOROTAN EVENT
 * ================================
 * Props:
 * - initialEvents: array data event
 */
export default function SorotanEvent({ initialEvents = [] }) {
  /**
   * ================================
   * REFS & STATE
   * ================================
   */
  const sliderRef = useRef(null); // reference slider
  const containerRef = useRef(null); // reference container (untuk detect klik luar)

  const [slidesToShow, setSlidesToShow] = useState(5); // jumlah card terlihat
  const [activeId, setActiveId] = useState(null); // card aktif (overlay terbuka)

  /**
   * ================================
   * DATA SOURCE
   * ================================
   */
  const displayEvents = initialEvents.length > 0 ? initialEvents : [];

  /**
   * ================================
   * STATUS BADGE STYLING
   * ================================
   * Menentukan warna badge berdasarkan status event
   */
  const getStatusBadgeStyles = (label) => {
    const l = (label || "").toLowerCase();
    let badgeClass = "bg-white/40 text-pink-500 border-white/25"; // default

    if (l.includes("akan") || l.includes("upcoming")) {
      badgeClass = "bg-blue-100/40 text-blue-700 border-blue-100/40";
    } else if (l.includes("sedang") || l.includes("ongoing")) {
      badgeClass = "bg-green-100/40 text-green-500 border-green-100/50";
    } else if (
      l.includes("telah") ||
      l.includes("berakhir") ||
      l.includes("finished")
    ) {
      badgeClass = "bg-zinc-100/40 text-zinc-700 border-zinc-100/30";
    }

    return badgeClass;
  };

  /**
   * ================================
   * RESPONSIVE SLIDES CALCULATION
   * ================================
   * Mengatur jumlah slide berdasarkan width layar
   */
  useEffect(() => {
    const calc = (w) => {
      if (w >= 1280) return 5;
      if (w >= 1024) return 4;
      if (w >= 960) return 3;
      if (w >= 768) return 2;
      if (w >= 600) return 2;
      return 2;
    };

    const update = () => setSlidesToShow(calc(window.innerWidth));

    if (typeof window !== "undefined") {
      update();
      window.addEventListener("resize", update);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", update);
      }
    };
  }, []);

  /**
   * ================================
   * CLICK OUTSIDE HANDLER
   * ================================
   * Menutup overlay jika klik di luar carousel
   */
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setActiveId(null);
      }
    };

    if (typeof window !== "undefined") {
      document.addEventListener("click", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("click", handler);
      }
    };
  }, []);

  /**
   * ================================
   * SLIDER SETTINGS (react-slick)
   * ================================
   */
  const settings = {
    dots: false,
    infinite: displayEvents.length > slidesToShow,
    speed: 600,
    cssEase: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    slidesToShow,
    slidesToScroll: 1,
    autoplay: false,
    swipeToSlide: true,
    draggable: true,

    // Custom arrows
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,

    /**
     * Reset overlay saat slide berubah / swipe
     */
    beforeChange: () => {
      if (activeId !== null) setActiveId(null);
    },
    onSwipe: () => {
      if (activeId !== null) setActiveId(null);
    },

    /**
     * Breakpoints tambahan dari react-slick
     */
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  /**
   * ================================
   * RENDER
   * ================================
   */
  return (
    <section
      className="bg-[#FFFFFF] py-8 mb-10 mt-20 relative overflow-visible"
      aria-labelledby="sorotan-title"
    >
      <div className="max-w-[1920px] w-full mx-auto px-2 sm:px-2">
        {/* ================================
            HEADER SECTION
        ================================= */}
        <header className="text-center mb-6" role="banner">
          <h2
            id="sorotan-title"
            className="text-#000000 font-bold text-[1.75rem] md:text-[2.5rem] mb-2"
          >
            Sorotan Event
          </h2>
          <p className="text-#626262 text-[0.9rem] md:text-base max-w-[600px] mx-auto mb-10">
            Deretan event terbaik dan paling menarik untuk diikuti!
          </p>
        </header>

        {/* ================================
            CAROUSEL CONTAINER
        ================================= */}
        <div
          ref={containerRef}
          className="relative px-2 md:px-7 pt-2 overflow-visible rounded-xl md:cursor-grab active:md:cursor-grabbing select-none"
          role="region"
          aria-label="Sorotan Event"
        >
          <Slider ref={sliderRef} {...settings}>
            {displayEvents.map((event) => (
              <div key={event.id} className="px-2 md:px-1.5 pt-4 pb-4">
                {/* ================================
                    EVENT CARD
                ================================= */}
                <article
                  tabIndex={0}
                  role="button"
                  aria-expanded={activeId === event.id}
                  aria-labelledby={`event-title-${event.id}`}
                  onClick={() =>
                    setActiveId(activeId === event.id ? null : event.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId(activeId === event.id ? null : event.id);
                    }
                    if (e.key === "Escape") setActiveId(null);
                  }}
                  className="relative rounded-xl overflow-hidden h-[240px] sm:h-[300px] md:h-[450px] border border-gray-100 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:z-20 group"
                >
                  {/* IMAGE / POSTER */}
                  <figure className="relative w-full h-full">
                    <Image
                      src={event.poster || "fallback-url"}
                      alt={event.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </figure>

                  {/* STATUS BADGE */}
                  <div className="absolute top-4 left-0 z-40 transform -translate-x-1">
                    <span
                      className={`border ${getStatusBadgeStyles(event.statusLabel)} backdrop-blur-md text-[10px] md:text-[12px] font-semibold px-3 py-1 rounded-r-full`}
                    >
                      {event.statusLabel}
                    </span>
                  </div>

                  {/* OVERLAY DETAIL */}
                  <figcaption
                    className={`absolute inset-0 bg-linear-to-t from-black/95 via-black/80 to-transparent p-3 flex flex-col justify-end transition-opacity ${
                      activeId === event.id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <h6 className="text-white font-bold text-sm">
                      {event.title}
                    </h6>

                    <time className="text-white/80 text-xs">
                      📅 {formatDate(event.startAt)}
                    </time>

                    <p className="text-white/80 text-xs">📍 {event.location}</p>

                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#7c3aed] text-white text-xs py-1 rounded-lg"
                    >
                      Ikuti Sekarang
                    </button>
                  </figcaption>
                </article>
              </div>
            ))}
          </Slider>
        </div>

        {/* ================================
            CTA BUTTON
        ================================= */}
        <div className="text-center mt-6">
          <Link
            href="/event"
            className="bg-[#43334C] text-white px-4 py-1.5 rounded-lg hover:bg-[#7c3aed]/20 hover:text-[#7c3aed]"
          >
            Lihat Event Lainnya
          </Link>
        </div>
      </div>
    </section>
  );
}

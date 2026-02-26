"use client";

import { useRef } from "react";
import Link from "next/link";
import PosterCard from "./cards/PosterCard";
import VideoCard from "./cards/VideoCard";
import ArtistCard from "./cards/ArtistCard";

/**
 * cardType per subCategory:
 *   'poster'  → PosterCard  (vertikal 2:3, overlay info hover)
 *   'video'   → VideoCard   (landscape 16:9, play button, timestamp)
 *   'artist'  → ArtistCard  (vertikal 3:4, branded Artist Radar)
 */

/**
 * CarouselBody — layout "carousel"
 *
 * Renders each sub-category as its own section with:
 *  - Section title + "Lihat Semua" link
 *  - Horizontally scrollable card row
 *  - Dot pagination indicator
 *
 * Props:
 *   subCategories : Array<{ title, slug?, linkUrl?, items: Array<{ src, alt, title, subtitle }> }>
 */
export default function CarouselBody({ subCategories = [] }) {
  if (!subCategories.length) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <p>Belum ada sub-kategori tersedia.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {subCategories.map((sub, idx) => (
        <SubCategoryRow key={sub.slug || idx} {...sub} />
      ))}
    </div>
  );
}

/* ---------- internal: one horizontal row per sub-category ---------- */

function SubCategoryRow({ title, linkUrl, items = [], cardType = "poster" }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  // Batasi jumlah item yang dirender
  const displayedItems = items.slice(0, 7);

  // Lebar card bervariasi per tipe
  const cardWidth = cardType === "video" ? "w-[280px] md:w-[320px]" : "w-[180px] md:w-[220px]";

  return (
    <section className="w-full max-w-[1920px] mx-auto mt-12 px-4 md:px-24">
      {/* Header: title + lihat semua */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-poppins font-bold text-[20px] md:text-[24px] text-black">
          {title}
        </h3>

        {linkUrl && (
          <Link
            href={linkUrl}
            className="text-sm font-medium text-zinc-500 hover:text-pink-600 transition-colors"
          >
            Lihat Semua
          </Link>
        )}
      </div>

      {/* Scrollable cards */}
      <div className="relative">
        {/* Left arrow (desktop) */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md hover:shadow-lg transition border border-zinc-500"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
        >
          {displayedItems.map((item, i) => (
            <div key={i} className={`flex-none ${cardWidth} snap-start`}>
              <CardSwitch cardType={cardType} item={item} />
            </div>
          ))}
        </div>

        {/* Right arrow (desktop) */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md hover:shadow-lg transition border border-zinc-500"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <DotIndicator count={displayedItems.length} />
    </section>
  );
}

/* ---------- Card switcher ---------- */

function CardSwitch({ cardType, item }) {
  if (cardType === "video") {
    return (
      <VideoCard
        src={item.src}
        alt={item.alt}
        title={item.title}
        timestamp={item.timestamp || item.subtitle}
        badge={item.badge}
      />
    );
  }

  if (cardType === "artist") {
    return (
      <ArtistCard
        src={item.src}
        alt={item.alt}
        name={item.name || item.title}
        role={item.role}
        episode={item.episode}
        subtitle={item.subtitle}
      />
    );
  }

  // default: poster
  return (
    <PosterCard
      src={item.src}
      alt={item.alt}
      title={item.title}
      subtitle={item.subtitle}
      badge={item.badge}
      meta={item.meta}
    />
  );
}

/* ---------- Dot pagination indicator ---------- */

function DotIndicator({ count }) {
  if (count <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-pink-300"
        />
      ))}
    </div>
  );
}

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
export default function CarouselBody({ subCategories = [], platformSlug = null, categorySlug = null }) {
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
        <SubCategoryRow key={sub.slug || idx} {...sub} platformSlug={platformSlug} categorySlug={categorySlug} />
      ))}
    </div>
  );
}

/* ---------- internal: one horizontal row per sub-category ---------- */

function SubCategoryRow({ title, linkUrl, items = [], cardType = "poster", platformSlug = null, categorySlug = null, slug: subSlug = null }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  // Batasi jumlah item yang dirender
  const displayedItems = items.slice(0, 9);

  // Lebar card bervariasi per tipe — responsive untuk mobile
  const cardWidth = cardType === "video"
    ? "w-[220px] sm:w-[280px] md:w-[320px]"
    : "w-[180px] md:w-[220px]";

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
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-90 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md hover:shadow-lg transition border border-zinc-500"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="py-4 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
        >
          {displayedItems.map((item, i) => (
            <div key={i} className={`flex-none ${cardWidth} snap-start`}>
              <CardSwitch cardType={cardType} item={item} platformSlug={platformSlug} categorySlug={categorySlug} subSlug={subSlug} />
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

function CardSwitch({ cardType, item, platformSlug = null, categorySlug = null, subSlug = null }) {
  if (cardType === "video") {
    return (
      <VideoCard
        imageUrl={item.imageUrl || item.src}
        youtube={item.youtube}
        url={item.url}
        alt={item.alt}
        title={item.title}
        prevdescription={item.prevdescription}
        tags={item.tags}
        host={item.host}
        guests={item.guests}
      />
    );
  }

  if (cardType === "artist") {
    // prefer internal detail route when id available
    const href = item.id && platformSlug && categorySlug && subSlug
      ? `/platform/${platformSlug}/${categorySlug}/${subSlug}/${item.id}`
      : item.url || undefined;
    return (
      <ArtistCard
        imageUrl={item.imageUrl || item.src}
        alt={item.alt}
        title={item.title}
        prevdescription={item.prevdescription}
        host={item.host}
        guests={item.guests}
        href={href}
        url={item.url}
        tags={item.tags}
      />
    );
  }

  // default: poster
  return (
    <PosterCard
      imageUrl={item.imageUrl || item.src}
      alt={item.alt}
      title={item.title}
      description={item.description || item.subtitle}
      tags={item.tags || (item.badge ? [item.badge] : [])}
      meta={item.meta}
      badge={item.badge}
      slug={item.slug}
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

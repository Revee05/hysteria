"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_IMAGE = "/image/tim-hero.png";
const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24">Image unavailable</text></svg>';

function ItemCard({ item, tall = false }) {
  const [src, setSrc] = useState(item.src || DEFAULT_IMAGE || placeholder);

  // Define mobile-first padding (e.g., 56.25% for 16:9 or 66.66% for 3:2)
  // and override it for desktop (sm: 640px+) based on the 'tall' prop.
  const responsivePadding = tall
    ? "pt-[66.66%]" // Always 66.66% if tall
    : "pt-[66.66%] sm:pt-[40%]"; // 66.66% on mobile, 40% on desktop if short

  return (
    <article
      className="relative rounded-lg overflow-hidden"
      aria-label={item.title}>
      <div className={`relative w-full ${responsivePadding}`}>
        <Image
          src={src}
          alt={item.title}
          fill
          unoptimized
          priority={tall}
          sizes={tall ? "(min-width:960px) 33vw, 100vw" : "(min-width:960px) 50vw, 100vw"}
          style={{ objectFit: "cover" }}
          onError={() => setSrc(placeholder)}
        />
      </div>

      <div className="absolute left-3 right-3 bottom-3 flex">
        <span className="bg-black/60 text-white px-3 py-1 rounded text-sm font-semibold">{item.title}</span>
      </div>
    </article>
  );
}

export default function PlatformKami({ items = [] }) {
  const hasInitialItems = Array.isArray(items) && items.length > 0;
  const [fetchedItems, setFetchedItems] = useState([]);

  useEffect(() => {
    if (hasInitialItems) {
      return;
    }

    let isMounted = true;

    async function loadHomepagePlatformCards() {
      try {
        const response = await fetch("/api/homepage/platform-cards", { cache: "no-store" });
        if (!response.ok) {
          if (isMounted) setFetchedItems([]);
          return;
        }

        const payload = await response.json();
        if (isMounted) {
          setFetchedItems(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch {
        if (isMounted) {
          setFetchedItems([]);
        }
      }
    }

    loadHomepagePlatformCards();

    return () => {
      isMounted = false;
    };
  }, [hasInitialItems]);

  const sourceItems = hasInitialItems ? items : fetchedItems;

  const normalizedItems = (Array.isArray(sourceItems) ? sourceItems : [])
    .map((item, index) => ({
      title: item?.title || `Platform ${index + 1}`,
      src: item?.src || DEFAULT_IMAGE,
      linkUrl: typeof item?.linkUrl === "string" && item.linkUrl.trim() ? item.linkUrl : null,
      slotType: item?.slotType === "short" ? "short" : "tall",
      order: typeof item?.order === "number" ? item.order : index,
    }))
    .sort((a, b) => a.order - b.order);

  const tallItems = normalizedItems.filter((item) => item.slotType === "tall").slice(0, 3);
  const shortItems = normalizedItems.filter((item) => item.slotType === "short").slice(0, 2);

  const rowOne = tallItems.length === 3 ? tallItems : normalizedItems.slice(0, 3).map((item) => ({ ...item, slotType: "tall" }));
  const rowTwo = shortItems.length === 2 ? shortItems : normalizedItems.slice(3, 5).map((item) => ({ ...item, slotType: "short" }));

  return (
    <section
      // className="w-full p-6 mb-20 border border-zinc-900"
      className="w-full p-6 mb-20"
      aria-labelledby="platform-kami-title">
      <header className="max-w-2xl text-center mx-auto">
        <h2
          id="platform-kami-title"
          className="text-2xl font-bold">
          Platform Kami
        </h2>
        <p className="mt-1 text-zinc-600">5 pilar yang menopang ekosistem gerobak hysteria</p>
      </header>

      <div className="max-w-[1200px] mx-auto mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rowOne.map((item, index) => (
            <div key={`${item.title}-${index}`}>
              {item.linkUrl ? (
                <Link
                  href={item.linkUrl}
                  aria-label={`Buka ${item.title}`}>
                  <ItemCard
                    item={item}
                    tall
                  />
                </Link>
              ) : (
                <ItemCard
                  item={item}
                  tall
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {rowTwo.map((item, index) => (
            <div key={`${item.title}-${index}`}>
              {item.linkUrl ? (
                <Link
                  href={item.linkUrl}
                  aria-label={`Buka ${item.title}`}>
                  <ItemCard item={item} />
                </Link>
              ) : (
                <ItemCard item={item} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

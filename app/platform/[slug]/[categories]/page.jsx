import React from "react";
import { notFound } from "next/navigation";
import HeroSection from "./_component/HeroSection";
import CarouselBody from "./_BodyComponent/CarouselBody";
import GridBody from "./_BodyComponent/GridBody";
import {
  listPublicPlatforms,
  getPublicPlatform,
  getPublicCategory,
} from "../../../../modules/public/platform/services/platform.public.service.js";

export async function generateMetadata({ params }) {
  const { slug, categories } = (await params) || {};
  if (!slug) return {};
  try {
    const [item, platform] = await Promise.all([
      getPublicCategory(slug, categories),
      getPublicPlatform(slug),
    ]);
    if (!item) return {};
    const logoPath = '/svg/Logo-hysteria.svg';
    const ogImage = item.image || platform?.head?.images?.[0]?.src || logoPath;

    return {
      title: item.title || platform?.head?.title || slug,
      description: item.imageSubtitle || platform?.head?.description || undefined,
      icons: {
        icon: logoPath,
        shortcut: logoPath,
        apple: logoPath,
      },
      openGraph: {
        title: item.title || platform?.head?.title || slug,
        description: item.imageSubtitle || platform?.head?.description || undefined,
        images: [{ url: ogImage, alt: item.title || platform?.head?.title || 'Hysteria' }],
      },
      twitter: {
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const platforms = await listPublicPlatforms();
    return platforms.flatMap(({ slug, categories }) =>
      (categories || []).map((c) => ({
        slug,
        categories: c.slug || (c.title || "").toLowerCase().replace(/\s+/g, "-"),
      }))
    );
  } catch {
    return [];
  }
}

export default async function Page({ params }) {
  const { slug, categories } = (await params) || {};
  if (!slug) return notFound();

  const [item, platform] = await Promise.all([
    getPublicCategory(slug, categories),
    getPublicPlatform(slug),
  ]);
  if (!platform || !item) return notFound();

  // Determine layout — default to 'grid' when not specified
  const layout = item.layout || "grid";

  return (
    <div className="bg-white">
      <main className="font-sans w-full max-w-[1920px] mx-auto bg-zinc-100 min-h-screen">
        {/* Shared hero section — same component, different metadata */}
        <HeroSection
          imageUrl={item.image || "/image/ilustrasi-menu.png"}
          title={item.imageTitle || item.title || platform.head?.title || "Platform"}
          description={item.imageSubtitle || "Explore our platform categories"}
        />

        {/* Dynamic body based on layout type */}
        {layout === "carousel" ? (
          <CarouselBody subCategories={item.subCategories || []} />
        ) : (
          <GridBody items={item.items || []} filters={item.filters || []} cardType={item.cardType || "poster"} />
        )}
      </main>
    </div>
  );
}

import React from "react";
import { notFound } from "next/navigation";
import HeroSection from "./_component/HeroSection";
import CarouselBody from "./_BodyComponent/CarouselBody";
import GridBody from "./_BodyComponent/GridBody";
import { listPlatforms, listCategories, getCategory, getPlatform } from "../../apiData";

export async function generateStaticParams() {
  return listPlatforms().flatMap(({ slug }) =>
    (listCategories(slug) || []).map((c) => ({
      slug,
      categories: c.slug || (c.title || "").toLowerCase().replace(/\s+/g, "-"),
    }))
  );
}

export default async function Page({ params }) {
  const { slug, categories } = (await params) || {};
  if (!slug) return notFound();

  const item = getCategory(slug, categories);
  const platform = getPlatform(slug);
  if (!platform || !item) return notFound();

  // Determine layout — default to 'grid' when not specified
  const layout = item.layout || "grid";

  return (
    <div className="bg-white">
      <main className="font-sans w-full max-w-[1920px] mx-auto bg-white min-h-screen">
        {/* Shared hero section — same component, different metadata */}
        <HeroSection
          imageUrl={item.image || platform.head?.images?.[0]?.src || "/image/ilustrasi-menu.png"}
          title={item.title || platform.head?.title || "Platform"}
          description={item.description || platform.head?.description || "Explore our platform categories"}
        />

        {/* Dynamic body based on layout type */}
        {layout === "carousel" ? (
          <CarouselBody subCategories={item.subCategories || []} />
        ) : (
          <GridBody items={item.items || []} filters={item.filters || []} />
        )}
      </main>
    </div>
  );
}

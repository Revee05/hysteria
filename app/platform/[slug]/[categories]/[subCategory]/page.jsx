import React from "react";
import { notFound } from "next/navigation";
import HeroSection from "../_component/HeroSection";
import VideoCard from "../_BodyComponent/cards/VideoCard";
import PosterCard from "../_BodyComponent/cards/PosterCard";
import ArtistCard from "../_BodyComponent/cards/ArtistCard";
import {
  listPublicPlatforms,
  getPublicPlatform,
  getPublicCategory,
} from "../../../../../modules/public/platform/services/platform.public.service.js";
import AnitalkInteractiveSection from "./_components/AnitalkInteractiveSection";
import GenericSubCategorySection from "./_components/GenericSubCategorySection";

const ANITALK_SLUG = "anitalk";

export async function generateStaticParams() {
  try {
    const platforms = await listPublicPlatforms();
    const params = [];

    for (const platform of platforms) {
      for (const category of platform.categories || []) {
        const categoryData = await getPublicCategory(platform.slug, category.slug);
        for (const sub of categoryData?.subCategories || []) {
          if (!sub?.slug) continue;
          params.push({
            slug: platform.slug,
            categories: category.slug,
            subCategory: sub.slug,
          });
        }
      }
    }

    return params;
  } catch {
    return [];
  }
}

function CardByType({ cardType, item }) {
  if (cardType === "video") {
    return (
      <VideoCard
        imageUrl={item.imageUrl || item.src}
        youtube={item.youtube}
        url={item.url}
        alt={item.alt}
        title={item.title}
        description={item.description}
        tags={item.tags}
        host={item.host}
        guests={item.guests}
      />
    );
  }

  if (cardType === "artist") {
    return (
      <ArtistCard
        imageUrl={item.imageUrl || item.src}
        alt={item.alt}
        title={item.title}
        description={item.description}
        host={item.host}
        guests={item.guests}
        url={item.url}
        tags={item.tags}
      />
    );
  }

  return (
    <PosterCard
      imageUrl={item.imageUrl || item.src}
      alt={item.alt}
      title={item.title}
      description={item.description || item.subtitle}
      tags={item.tags || []}
      meta={item.meta}
    />
  );
}

export default async function Page({ params }) {
  const { slug, categories, subCategory } = (await params) || {};
  if (!slug || !categories || !subCategory) return notFound();

  const [categoryData, platformData] = await Promise.all([
    getPublicCategory(slug, categories),
    getPublicPlatform(slug),
  ]);

  if (!categoryData || !platformData) return notFound();

  const selectedSub = (categoryData.subCategories || []).find(
    (sub) => sub.slug === subCategory
  );

  if (!selectedSub) return notFound();

  const cardType = selectedSub.cardType || "poster";
  const items = selectedSub.items || [];
  const isAnitalkPage = subCategory === ANITALK_SLUG;
  return (
    <div className="bg-[#f3f3f3] overflow-x-hidden">
      <main className="font-sans w-full w-[1920px] mx-auto min-h-screen">
        <HeroSection
          imageUrl={categoryData.image || "/image/ilustrasi-menu.png"}
          title={selectedSub.title || categoryData.title || platformData.head?.title || "Platform"}
          description={categoryData.imageSubtitle || categoryData.description || "Explore content"}
        />

        {isAnitalkPage ? (
          <AnitalkInteractiveSection selectedSub={selectedSub} items={items} />
        ) : (
          <GenericSubCategorySection selectedSub={selectedSub} cardType={cardType} items={items} />
        )}
      </main>
    </div>
  );
}


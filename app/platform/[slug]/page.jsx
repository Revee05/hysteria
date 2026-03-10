import React from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import HeadSection from '../../../_sectionComponents/halaman_platform/head.section'
import ListCategorySection from '../../../_sectionComponents/halaman_platform/list_category.section'
import MediaSection from '../../../_sectionComponents/halaman_platform/media.section'
import { listPlatforms } from '../../../modules/admin/platform/services/platform.service'
import { getPublicPlatform } from '../../../modules/public/platform/services/platform.public.service.js'

export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  if (!slug) return {};
  try {
    const platform = await getPublicPlatform(slug);
    if (!platform) return {};
    const logoPath = '/svg/Logo-hysteria.svg';
    const ogImage = platform.head?.images?.[0]?.src || logoPath;

    return {
      title: platform.head?.title || slug,
      description: platform.head?.description || undefined,
      icons: {
        icon: logoPath,
        shortcut: logoPath,
        apple: logoPath,
      },
      openGraph: {
        title: platform.head?.title || slug,
        description: platform.head?.description || undefined,
        images: [{ url: ogImage, alt: platform.head?.title || 'Hysteria' }],
      },
      twitter: {
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

const MAINTENNACE = false

export async function generateStaticParams() {
  try {
    const platforms = await listPlatforms()
    return (platforms || []).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function Page({ params }) {
  const { slug } = (await params) || {}

  if (!slug) return notFound()

  // Build absolute URL required by fetch() in Server Components
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  let data = null
  try {
    const res = await fetch(`${baseUrl}/api/platforms/${slug}`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      data = json?.data ?? null
    }
  } catch {
    // silently fall back to maintenance view
  }

  if (!data || MAINTENNACE) {
    return (
      <main className="bg-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl text-zinc-900 font-bold mb-4">Platform: {slug}</h1>
          <p className="mt-4 text-zinc-700">
            Sedang dalam tahap maintenance.
          </p>
        </div>
      </main>
    )
  }

  // Pass DB field names directly — components use exact same names as DB columns
  const {
    headline,      // Platform.headline
    subHeadline,   // Platform.subHeadline
    instagram,     // Platform.instagram
    youtube,       // Platform.youtube
    youtubeProfile,// Platform.youtubeProfile
    images,        // PlatformImage[] type=main → [{ src, alt }]
    multyImages,   // derived: images.length > 1
    categories,    // PlatformCategory[] → [{ title, slug, url, imageUrl, ... }]
  } = data

  return (
    <main className="bg-white min-h-screen">
      <HeadSection
        headline={headline}
        subHeadline={subHeadline}
        instagram={instagram}
        youtube={youtube}
        images={images}
        multyImages={multyImages}
      />
      <MediaSection youtubeProfile={youtubeProfile} />
      <ListCategorySection categories={categories} />
    </main>
  )
}

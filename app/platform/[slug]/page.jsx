import React from 'react'
import { notFound } from 'next/navigation'
import HeadSection from '../../../_sectionComponents/halaman_platform/head.section'
import ListCategorySection from '../../../_sectionComponents/halaman_platform/list_category.section'
import MediaSection from '../../../_sectionComponents/halaman_platform/media.section'
import { getPlatform, listPlatforms } from '../apiData'

const MAINTENNACE=false

export async function generateStaticParams() {
  return listPlatforms().map((p) => ({ slug: p.slug }))
}

export default async function Page({ params }) {
  const { slug } = (await params) || {}

  if (!slug) return notFound()

  const data = getPlatform(slug)

  // If we don't have a configured page, render a generic view instead of 404
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

  return (
    <main className="bg-white min-h-screen">
      <HeadSection {...data.head} />
      <MediaSection mediaURL={data.mediaURL} />
      <ListCategorySection items={data.categories} />
    </main>
  )
}

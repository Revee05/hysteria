import React from 'react'
import { notFound } from 'next/navigation'
import HeadSection from '../../../_sectionComponents/halaman_platform/head.section'
import ListCategorySection from '../../../_sectionComponents/halaman_platform/list_category.section'
import MediaSection from '../../../_sectionComponents/halaman_platform/media.section'

const MAINTENNACE=false

const PLATFORM_DATA = {
  'artlab': {
    head: {
      title: 'Laboratorium seni, eksperimentasi, dan kolaborasi',
      description: 'Artlab Hysteria adalah ruang kolaborasi seni-budaya tempat ide diuji, diproduksi, dan dipertemukan dengan publik. Kami membuka laboratorium terbuka bagi eksperimen lintas disiplin, kerja kolektif, dan pengembangan program yang relevan dengan konteks sosial hari ini.',
      instagramUrl: '#',
      youtubeUrl: '#',
      images: [
        { src: '/image/Artlab.jpg', alt: 'ArtLab' }
      ]
    },
    categories: [
      { title: 'Merchandise', href: '/platform/artlab/merchandise', image: '/image/list-item.jpg' },
      { title: 'Podcast ArtLab', href: '/platform/artlab/podcast-artlab', image: '/image/list-item.jpg' },
      { title: 'Workshop ArtLab', href: '/platform/artlab/workshop-artlab', image: '/image/list-item.jpg' },
      { title: 'Screening Film', href: '/platform/artlab/screening-film', image: '/image/list-item.jpg' },
      { title: 'Untuk Perhatian', href: '/platform/artlab/screening-film', image: '/image/list-item.jpg' }
    ],
    mediaURL: 'https://www.youtube.com/embed/M7lc1UVf-VE'
  },
  'ditampart': {
    head: {
      title: 'Laboratorium Para Seniman Semarang Eksis',
      description: 'Kolektif Hysteria merupakan ruang produksi artistik sekaligus fasilitator untuk pertemuan lintas disipliner dalam skala lokal hingga global untuk mencari trobosan-trobosan dalam persoalan kreatifitas, seni, komunitas, anak muda, dan isu kota.',
      // instagramUrl: '#',
      // youtubeUrl: '#',
      images: [
        { src: '/image/ditampart1.png', alt: 'Ditam Part' },
        { src: '/image/ditampart2.png', alt: 'Ditam Part' },
      ],
      multyImages: true
    },
    categories: [
    { title: '3D', image: '/image/list-item.jpg', href: '/platform/ditampart/3d' },
		{ title: 'Foto Kegiatan', image: '/image/list-item.jpg', href: '/platform/ditampart/foto-kegiatan' },
		{ title: 'Kebutuhan Ditampart', image: '/image/list-item.jpg', href: '/platform/ditampart/kebutuhan-ditampart' },
		{ title: 'Mock Up and Poster', image: '/image/list-item.jpg', href: '/platform/ditampart/mock-up-and-poster' },
		{ title: 'Short Documentary', image: '/image/list-item.jpg', href: '/platform/ditampart/short-documentary' }
    ],
    mediaURL: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  'laki-masak': {
    head: {
      title: 'Panggung Ekspresi Menghadirkan Sejuta Rasa dan Cerita',
      description: 'Laki Masak adalah ruang masak yang nggak cuma soal resep, tapi juga soal cerita, obrolan, dan sikap. Di dapur, laki-laki hadir bukan buat pamer jago, tapi buat berbagi—tentang rasa, proses, ingatan, dan keseharian yang sering luput dibicarakan.',
      instagramUrl: '#',
      youtubeUrl: '#',
      images: [ 
        { src: '/image/Artlab.jpg', alt: 'Laki Masak' } 
      ]
    },
    categories: [
        { title: 'Meramu', image: '/image/list-item.jpg', href: '/platform/laki-masak/meramu' },
        { title: 'Homecooked', image: '/image/list-item.jpg', href: '/platform/laki-masak/homecooked' },
        { title: 'Komik Ramuan', image: '/image/list-item.jpg', href: '/platform/laki-masak/komik-ramuan' },
        { title: 'Pre-Order', image: '/image/list-item.jpg', href: '/platform/laki-masak/pre-order' },
    ],
    mediaURL: 'https://www.youtube.com/embed/e-ORhEE9VVg'
  }
}

export async function generateStaticParams() {
  return Object.keys(PLATFORM_DATA).map(slug => ({ slug }))
}

export default async function Page({ params }) {
  const { slug } = (await params) || {}

  if (!slug) return notFound()

  const data = PLATFORM_DATA[slug]

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

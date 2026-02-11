import React from 'react'
import Image from 'next/image'

export default function ListCategorySection({ 
  items = [] 
}) {
  if (!items || items.length === 0) return null

  // Intrinsic image size used by next/image (keeps layout stable)
  const CARD_W = 800
  const CARD_H = 450

  return (
    <section className="px-4 py-8 sm:py-8 md:py-8 lg:py-8 text-black">
      <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1800px] px-0 sm:px-2 md:px-4">
        {/* item wrapper: responsive grid columns */}
        {/* <div className="px-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 border border-zinc-400"> */}
        <div className="px-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
          {items.map((it, idx) => (
            <a
              key={idx}
              href={it.href}
              className="py-3 group block bg-white overflow-hidden border-b border-zinc-400"
            >
              {/* item image: adjust visible heights per breakpoint here */}
              <div className="overflow-hidden rounded-md border border-zinc-200">
                <Image
                  src={it.image}
                  alt={it.title}
                  width={CARD_W}
                  height={CARD_H}
                  className="w-full max-w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                />
              </div>

              {/* kategori text */}
              <div className="mt-4 flex items-center justify-between">
                <h3 className="text-base sm:text-sm font-semibold text-black">{it.title}</h3>
                <svg
                  className="w-5 h-5 text-black opacity-70 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

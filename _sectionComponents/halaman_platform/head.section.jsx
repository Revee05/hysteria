import React from 'react'
import Image from 'next/image'

/**
 * HeadSection
 * --------------------------------------------------
 * Komponen hero/header reusable.
 * Menampilkan teks (title + description) dan visual (gambar tunggal / multiple).
 * Layout responsif dan dikontrol penuh via props.
 */
export default function HeadSection({
  title,                 // Judul utama section
  description,           // Deskripsi pendukung
  instagramUrl,          // URL Instagram (opsional)
  youtubeUrl,            // URL YouTube (opsional)
  images = [],           // Array data gambar
  showSocialButtons = true, // Toggle tampil/tidak tombol sosial
  multyImages = false    // Mode tampilan gambar besar / multiple
}) {

  return (
    <section className="py-8 sm:py-12 md:py-12 lg:py-16 text-black">
      
      <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1800px] px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">

        {/* ================= TEXT AREA ================= */}
        <div>
          {/* Title */}
          <h1 className="text-[28px] sm:text-[40px] md:text-[50px] font-bold leading-[150%] mb-4">
            {title}
          </h1>

          {/* Description */}
          <h2 className="text-black mb-6 max-w-full sm:max-w-xl text-[14px] sm:text-[16px] md:text-[20px] font-normal leading-[150%]">
            {description}
          </h2>

          {/* Social buttons: render only when enabled and URL exists */}
          {showSocialButtons && (instagramUrl || youtubeUrl) && (
            <div className="flex gap-3 flex-wrap">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  className="
                    inline-block bg-white text-pink-600 px-4 py-2 rounded-md 
                    border border-pink-400 shadow-sm 
                    hover:bg-[#E1306C] hover:border-[#C13584] hover:text-white
                    transition-colors
                  "
                >
                  Instagram
                </a>
              )}

              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  className="
                    inline-block bg-white text-pink-600 px-4 py-2 rounded-md
                    border border-pink-400 shadow-sm
                    hover:bg-[#ff0000] hover:border-[#cc0000] hover:text-white
                    transition-colors
                  "
                >
                  Youtube
                </a>
              )}
            </div>
          )}
        </div>

        {/* ================= IMAGE AREA ================= */}
        <div className="flex justify-center md:justify-end order-first md:order-last">

          {/* ===== CASE: SATU GAMBAR ===== */}
          {images.length === 1 ? (
            <div
              /**
               * Container image tunggal (responsive, mobile constrained)
               * - Small screens: full width but limited max-height to avoid oversized hero
               * - Larger screens: constrained max-width and taller max-height
               */
              className={`w-full relative overflow-hidden bg-white rounded-lg p-2 sm:p-3 mx-auto
                ${multyImages
                  ? 'max-w-[92%] sm:max-w-[720px]'
                  : 'max-w-[70%] sm:max-w-[360px]'}
                `}
            >
              <div className="relative w-full overflow-hidden rounded-lg aspect-[500/516]">
                <Image
                  src={images[0].src}
                  alt={images[0].alt}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 768px) 70vw, 360px"
                  className="rounded-lg object-contain"
                />
              </div>
            </div>
          ) : (
            /**
             * ===== CASE: MULTIPLE GAMBAR =====
             * Ditampilkan dalam posisi staggered (naik–turun)
             * untuk efek depth / layering visual
             */
            <div
              className={`flex ${
                multyImages
                  ? 'gap-10 sm:gap-12 md:gap-16'
                  : 'gap-3 sm:gap-4 md:gap-6'
              } items-center`}
            >
              {images.map((image, index) => {

                /**
                 * Wrapper tiap gambar:
                 * - Ukuran beda tergantung multyImages
                 * - Gambar pertama naik, kedua turun
                 * - z-index untuk efek tumpukan
                 */
                const wrapperClass = multyImages
                  ? `w-36 sm:w-48 md:w-64 bg-transparent transform
                     ${index === 0
                       ? '-translate-y-4 md:-translate-y-6 z-10'
                       : 'translate-y-4 md:translate-y-6 z-10'}`
                  : `w-36 sm:w-48 md:w-64 bg-transparent shadow-lg transform 
                     ${index === 0
                       ? '-translate-y-7 md:-translate-y-12 z-10'
                       : 'translate-y-7 md:translate-y-12 z-10'}`

                return (
                  <div key={index} className={wrapperClass}>
                    <div
                      className={`relative w-full overflow-hidden rounded-lg ${
                        multyImages ? 'aspect-[480/600]' : 'aspect-[500/516]'
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes={
                          multyImages
                            ? '(max-width: 640px) 35vw, (max-width: 768px) 30vw, 256px'
                            : '(max-width: 640px) 35vw, (max-width: 768px) 30vw, 256px'
                        }
                        className="rounded-lg object-contain"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

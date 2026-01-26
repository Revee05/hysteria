"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function PlatformKami() {
  return (
    <section
      className="w-full p-6 border border-zinc-900 mb-20"
      aria-labelledby="platform-kami-title"
    >
      <header className="max-w-2xl text-center mx-auto">
        <h2 id="platform-kami-title" className="text-2xl font-bold">
          Platform Kami
        </h2>
        <p className="mt-1 text-zinc-600">5 pilar yang menopang ekosistem gerobak hysteria</p>
      </header>

      {(() => {
        const items = [
          { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', title: 'Hysteria Artlab' },
          { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764b0d?auto=format&fit=crop&w=1200&q=80', title: 'Peka Kota' },
          { src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80', title: 'Laki Masak' },
          { src: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80', title: 'Bukit Buku' },
          { src: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80', title: 'Ditam Part' },
        ];

        const placeholder =
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24">Image unavailable</text></svg>';

        function ItemCard({ item, tall = false }) {
          const [src, setSrc] = useState(item.src);

          return (
            <article className="relative rounded-lg overflow-hidden" aria-label={item.title}>
              <div style={{ position: 'relative', width: '100%', paddingTop: tall ? '66.66%' : '40%' }}>
                <Image
                  src={src}
                  alt={item.title}
                  fill
                  unoptimized
                  priority={tall}
                  sizes={tall ? '(min-width:960px) 33vw, 100vw' : '(min-width:960px) 50vw, 100vw'}
                  style={{ objectFit: 'cover' }}
                  onError={() => setSrc(placeholder)}
                />
              </div>

              <div className="absolute left-3 right-3 bottom-3 flex">
                <span className="bg-black/60 text-white px-3 py-1 rounded text-sm font-semibold">{item.title}</span>
              </div>
            </article>
          );
        }

        return (
          <div className="max-w-[1200px] mx-auto mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {items.slice(0, 3).map((item) => (
                <div key={item.title}>
                  <ItemCard item={item} tall />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {items.slice(3).map((item) => (
                <div key={item.title}>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </section>
  );
}

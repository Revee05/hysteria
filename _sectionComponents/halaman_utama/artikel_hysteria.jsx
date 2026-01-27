"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ArtikelHysteria({ featured, list = [] }) {
  const fallback = {
    featured: {
      id: "f1",
      title: "Kohe­si Sosial dan Perlunya Perubahan Paradigma Global",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&s=0b2c1b6f7b3f2c6b6b9f8a2b4a1f6d3a",
      url: "/artikel/kohe-si-sosial",
      date: "2019-11-15",
    },
    list: [
      {
        id: "a1",
        title: "Kecemasan Manusia Modern dan Hal-Hal yang Tak Selesai",
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9d8e3d0f6e4a4b2a6f8c1d4b5e7a3c2b",
        url: "/artikel/kecemasan-manusia-modern",
        date: "2019-11-15",
      },
      {
        id: "a2",
        title: "Proyek Seni, Aktivasi Kampung dan Narasi Kota",
        image:
          "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
        url: "/artikel/proyek-seni-aktivasi",
        date: "2017-11-07",
      },
    ],
  };

  const feat = featured ?? fallback.featured;
  const items = list.length ? list : fallback.list;

  return (
    <section
      aria-labelledby="artikel-hysteria-heading"
      className="py-6 px-6 sm:px-6 lg:px-28 mb-20"
      // className="py-6 px-6 sm:px-6 lg:px-28 mb-20 border border-zinc-900"
    >
      <div className="w-full max-w-[1920px] mx-auto">
        <header className="flex justify-between items-baseline mb-6">
          <h2
            id="artikel-hysteria-heading"
            className="m-0 text-xl sm:text-3xl font-bold"
          >
            Artikel di Hysteria
          </h2>
          <Link href="/artikel" className="text-sm sm:text-base font-semibold text-gray-900 underline">
            Lihat Semua
          </Link>
        </header>

        <div className="py-2 grid grid-cols-1 md:grid-cols-[800px_350px] gap-10 items-start justify-center">
          {/* kolom kiri */}
          <article
            aria-labelledby={`artikel-${feat.id}`}
            className="rounded-lg overflow-hidden shadow-md bg-white md:ring-opacity-80"
          >
            <figure className="relative m-0 h-[220px] sm:h-[320px] md:h-[400px]">
              <Image
                src={feat.image}
                alt={feat.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <figcaption className="absolute left-4 right-4 bottom-4 sm:left-6 sm:right-6 sm:bottom-6 text-white drop-shadow-lg z-10">
                <h3
                  id={`artikel-${feat.id}`}
                  className="m-0 text-lg sm:text-2xl font-bold leading-tight"
                >
                  <Link href={feat.url} className="text-white no-underline">
                    {feat.title}
                  </Link>
                </h3>
                <time
                  dateTime={feat.date}
                  className="block mt-2 text-sm text-white/95"
                >
                  {new Date(feat.date).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </figcaption>
            </figure>
          </article>

          {/* kolom kanan */}
          <aside aria-label="Artikel lain" className="">
            <ul className="list-none m-0 p-0 flex flex-col gap-6">
              {items.slice(0, 2).map((it) => (
                <li key={it.id}>
                  <article className="rounded-lg overflow-hidden shadow-sm bg-zinc-800">
                    <figure className="relative m-0 h-[140px] sm:h-[165px] md:h-[185px] w-full">
                      <Image
                        src={it.image}
                        alt={it.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <figcaption className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-4 text-white z-10">
                        <h4 className="m-0 text-sm sm:text-sm font-semibold leading-tight">
                          <Link
                            href={it.url}
                            className="text-white no-underline line-clamp-2"
                          >
                            {it.title}
                          </Link>
                        </h4>
                        <time
                          dateTime={it.date}
                          className="block mt-1 text-xs text-white/90"
                        >
                          {new Date(it.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </figcaption>
                    </figure>
                  </article>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

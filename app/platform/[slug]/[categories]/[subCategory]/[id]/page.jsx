import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublicContentItem } from "../../../../../../modules/public/platform/services/platform.public.service.js";
import ArtistCard from "../../_BodyComponent/cards/ArtistCard";

export default async function ArtistDetailPage({ params }) {
  const { slug, categories, subCategory, id } = (await params) || {};
  if (!slug || !categories || !subCategory || !id) return notFound();

  const data = await getPublicContentItem(id);
  if (!data) return notFound();

  const { item, related } = data;

  const backHref = `/platform/${slug}/${categories}/${subCategory}`;
  const heroImg = item.imageUrl || "/image/artist.webp";
  const isLocal = typeof heroImg === "string" && heroImg.startsWith("/");

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── TWO-COLUMN MAIN ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-5 md:px-12 pt-15 pb-12 md:pt-15 md:pb-16">
        {/* Back button */}
        <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition text-sm mb-8"
            aria-label="Kembali"
            >
            <ArrowLeft className="w-4 h-4 cursor-pointer" />
            <span className="cursor-pointer">Kembali</span>
        </Link> 

        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ── LEFT: Artist poster card ─────────────────────── */}
          <div className="w-full md:w-[260px] lg:w-[280px] shrink-0">
            <div className="relative w-full aspect-[9/16] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={heroImg}
                alt={item.alt || item.title || "Artist"}
                fill
                unoptimized={!isLocal}
                priority
                className="object-cover brightness-75"
              />
              {/* gradient bottom overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              {/* Card text overlay */}
              <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16">
                {item.title && (
                  <h3 className="text-white text-sm font-bold leading-tight">{item.title}</h3>
                )}
                {item.prevdescription && (
                  <p className="text-white/80 text-[11px] mt-1 line-clamp-3">{item.prevdescription}</p>
                )}
                {item.host != null && (
                  <p className="text-[10px] font-medium mt-1.5">
                    <span style={{ color: "#E83C91" }}>Host: </span>
                    <span className="text-white">{item.host || "—"}</span>
                  </p>
                )}
                {item.guests?.length > 0 && (
                  <p className="text-[10px] font-medium mt-1 flex gap-x-1 items-start mb-2">
                    <span style={{ color: "#E83C91" }} className="shrink-0">Collaborator: </span>
                    <span className="text-white line-clamp-2 break-words">{item.guests.join(", ")}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Content ──────────────────────────────── */}
          <div className="flex-1 min-w-0 p-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#43334C] leading-tight mb-5">
              {item.title}
            </h1>

            {/* Full description */}
            {item.description && (
              <div className="text-zinc-600 text-sm md:text-base leading-[20px] whitespace-pre-line mb-6">
                {item.description}
              </div>
            )}

            {/* Collaborator + Host info */}
            {(item.guests?.length > 0 || item.host) && (
              <div className="mb-5 text-sm text-zinc-700 space-y-1">
                {item.guests?.length > 0 && (
                  <p>
                    <span className="font-semibold">Artist. Collaborator:</span>{" "}
                    <span className="text-zinc-600">{item.guests.join(", ")}</span>
                  </p>
                )}
                {item.host && (
                  <p>
                    <span className="font-semibold">Project Director &amp; Host:</span>{" "}
                    <span className="text-zinc-600">{item.host}</span>
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-7">
                <span className="text-[#E83C91] font-semibold">Tags:</span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium flex-wrap"
                    style={{ backgroundColor: "#fce7f3", color: "#E83C91" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {item.instagram && (
                <a
                  href={item.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-md border border-pink-500 text-sm font-medium text-pink-500 hover:bg-pink-500 hover:text-zink-100 hover:text-zinc-100 transition"
                >
                  Lihat di Instagram
                </a>
              )}
              {item.youtube && (
                <a
                  href={item.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-md border border-pink-500 text-sm font-medium text-pink-500 hover:bg-pink-500 hover:text-zinc-100 transition"
                >
                  Lihat di Youtube
                </a>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-full border border-zinc-400 text-sm font-medium text-zinc-700 hover:border-pink-500 hover:text-pink-600 transition"
                >
                  Lihat Selengkapnya
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── KONTEN LAINNYA ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-[#E83C91]">
          <div className="max-w-6xl mx-auto px-5 md:px-12">
            <h2 className="text-white text-xl md:text-2xl font-bold text-center mb-8">
              Konten Lainnya
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((r) => (
                <div key={r.id} className="flex flex-col gap-3">
                  <ArtistCard
                    imageUrl={r.imageUrl}
                    alt={r.alt}
                    title={r.title}
                    prevdescription={r.prevdescription}
                    host={r.host}
                    guests={r.guests?.length > 0 ? r.guests : undefined}
                    tags={r.tags}
                    href={`${backHref}/${r.id}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href={backHref}
                className="bg-zinc-100 px-8 py-2.5 rounded-md text-sm text-pink-500 font-semibold hover:border-1 border-green-500 hover:text-green-500"
              >
                Lihat lebih banyak
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

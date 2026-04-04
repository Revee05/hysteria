import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublicContentItem } from "../../../../../../modules/public/platform/services/platform.public.service.js";
import ArtistCard from "../../_BodyComponent/cards/ArtistCard";
import LightboxImage from "../../../../../../components/ui/LightboxImage";
import ViewTracker from "../_components/ViewTracker.client.jsx";

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
    <div className="bg-zinc-50 min-h-screen font-sans">
      {/* Tracker Statistik View (Client-side) */}
      <ViewTracker contentId={item.id} />

      {/* ── TWO-COLUMN MAIN ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-5 md:px-12 pt-17 pb-12 md:pt-17 md:pb-20">
        <div className="bg-white flex flex-col md:flex-row gap-10 md:gap-14 items-start rounded-lg border border-gray-100 p-5 md:p-5 shadow-xl">
          {/* ── LEFT: Artist poster (glass + glow edge) ─────────────── */}
          <div className="w-[250px] md:w-[260px] lg:w-[280px] shrink-0 mx-auto md:mx-0">
            <div
              className="relative w-full aspect-9/16 rounded-2xl p-1"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,60,145,0.06), rgba(99,102,241,0.04))",
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-gray-400 shadow-2xl hover:scale-[1.03]">
                <LightboxImage
                  src={heroImg}
                  alt={item.alt || item.title || "Artist"}
                  isLocal={isLocal}
                  className="object-cover cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Content ──────────────────────────────── */}
          <div className="flex-1 min-w-0 p-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#43334C] leading-tight mb-5">
              {item.title}
            </h1>

            {/* Full description */}
            {item.description && (
              <div className="text-zinc-600 text-justify text-sm md:text-base leading-[20px] whitespace-pre-line mb-6">
                {item.description}
              </div>
            )}

            {/* Collaborator + Host info */}
            {(item.guests?.length > 0 || item.host) && (
              <div className="mb-5 text-sm text-zinc-700 space-y-1">
                {item.guests?.length > 0 && (
                  <p>
                    <span className="font-semibold">
                      Artist. Collaborator :
                    </span>{" "}
                    <span className="text-pink-500">
                      {item.guests.join(", ")}
                    </span>
                  </p>
                )}
                {item.host && (
                  <p>
                    <span className="font-semibold">
                      Project Director &amp; Host :
                    </span>{" "}
                    <span className="text-pink-500">{item.host}</span>
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-row gap-2 mb-7">
                <span className="text-[#43334C] font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium flex-wrap underline"
                      style={{ backgroundColor: "#fce7f3", color: "#E83C91" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="justify-center md:justify-start flex flex-wrap gap-3">
              {item.instagram && (
                <a
                  href={item.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-md border border-pink-500 font-medium text-pink-500 hover:bg-pink-500 hover:text-zinc-100 transition"
                >
                  Lihat di Instagram
                </a>
              )}
              {item.youtube && (
                <a
                  href={item.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 text-xs md:px-6 md:py-2 md:text-sm rounded-md border border-pink-500 font-medium text-pink-500 hover:bg-pink-500 hover:text-zinc-100 transition"
                >
                  Lihat di Youtube
                </a>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs md:px-6 md:py-2 md:text-sm rounded-full border border-zinc-400 font-medium text-zinc-700 hover:border-pink-500 hover:text-pink-600 transition"
                >
                  Lihat Selengkapnya
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* todo : buat supaya batas antara section atas dan section bawah memiliki gradient warna supaya terlihat lebih halus */}

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
                className="bg-zinc-100 px-8 py-2.5 rounded-md text-sm text-pink-500 font-semibold border hover:border hover:text-green-500"
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

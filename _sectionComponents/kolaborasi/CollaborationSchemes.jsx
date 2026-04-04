"use client";

import Image from "next/image";

const defaultSchemes = [
  { label: "Kolaborasi\nProgram &\nEvent", img: "/images/kolaborasi/skema-1.png" },
  { label: "Kolaborasi\nKomunitas &\nEdukasi", img: "/images/kolaborasi/skema-1.png" },
  { label: "Kolaborasi\nKonten &\nPublikasi", img: "/images/kolaborasi/skema-1.png" },
  { label: "Kolaborasi\nPendukung/\nSponsor", img: "/images/kolaborasi/skema-1.png" },
];

export default function CollaborationSchemes({ title = "Skema Kolaborasi Kami", description = "", schemes = [] }) {
  const items = (schemes && schemes.length > 0 ? schemes : defaultSchemes).slice(0, 4);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-center text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>

        {description && <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-zinc-700">{description}</p>}

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((s, idx) => (
              <div key={idx} className="h-64 overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
                {s.imageUrl || s.img ? (
                  <div className="relative h-full overflow-hidden">
                    <Image src={s.imageUrl || s.img} alt={s.title || s.label} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute inset-0 flex items-center px-6">
                      <div className="whitespace-pre-line text-xl font-extrabold leading-6 text-white">{s.title || s.label}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-center bg-linear-to-br from-pink-400 to-pink-600 p-6">
                    <div className="mb-2 text-lg font-extrabold text-white">{s.title || s.label}</div>
                    {s.description && <p className="text-xs text-white/90">{s.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

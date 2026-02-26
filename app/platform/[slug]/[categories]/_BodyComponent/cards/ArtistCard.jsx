import Image from "next/image";

/**
 * ArtistCard — kartu vertikal bergaya "Artist Radar" branded
 * Digunakan untuk: Artist Radar, dll.
 *
 * Props:
 *   src      : string
 *   alt      : string
 *   name     : string  — nama artist
 *   role     : string  — peran/deskripsi singkat (e.g. "Vocalist & Lyricist")
 *   episode  : string  — info episode (opsional, e.g. "Edisi 8")
 *   subtitle : string  — fallback teks bawah jika role tidak ada
 */
export default function ArtistCard({ src, alt, name, role, episode, subtitle }) {
  const imgSrc = src || "/image/artist.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  return (
    <div className="group relative w-full aspect-[1/2] overflow-hidden rounded-3xl bg-zinc-800 cursor-pointer">
      {/* Background image */}
      <Image
        src={imgSrc}
        alt={alt || name || "Artist"}
        fill
        unoptimized={!isLocal}
        sizes="(max-width:640px) 50vw, 260px"
        className="object-cover brightness-75 transition-transform duration-300 group-hover:scale-105"
      />

      {/* Branded label "artist radar" di kiri atas */}
      {/* <div className="absolute top-3 left-3 z-10">
        <span className="text-white/80 text-[9px] font-bold tracking-widest uppercase leading-none">
          artist
        </span>
        <br />
        <span className="text-white text-[9px] font-bold tracking-widest uppercase leading-none">
          radar
        </span>
      </div> */}

      {/* Bottom overlay — info artist */}
      {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8">
        {episode && (
          <p className="text-white/60 text-[10px] font-medium mb-0.5">{episode}</p>
        )}
        {name && (
          <h3 className="text-white text-sm font-bold leading-tight">{name}</h3>
        )}
        {(role || subtitle) && (
          <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{role || subtitle}</p>
        )}
      </div> */}

      {/* Hover ring */}
      <div className="absolute inset-0 ring-inset ring-2 ring-white/0 group-hover:ring-white/20 rounded-xl transition-all duration-200" />
    </div>
  );
}

import Image from "next/image";

/**
 * VideoCard — thumbnail landscape 16:9 dengan play button
 * Digunakan untuk: Anitalk, dll.
 *
 * Props:
 *   src       : string
 *   alt       : string
 *   title     : string
 *   badge     : string  — teks badge kecil di pojok kiri atas (opsional)
 */
export default function VideoCard({ src, alt, title, badge }) {
  const imgSrc = src || "/image/video.webp";
  const isLocal = typeof imgSrc === "string" && imgSrc.startsWith("/");

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-zinc-100 border border-zinc-300 cursor-pointer">
      {/* Thumbnail 16:9 */}
      <div className="relative w-full aspect-video">
        <Image
          src={imgSrc}
          alt={alt || title || "Video"}
          fill
          unoptimized={!isLocal}
          sizes="(max-width:640px) 80vw, 300px"
          className="object-cover brightness-90 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Dark scrim */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

        {/* Play button di tengah */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition">
            <svg className="w-5 h-5 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Badge pojok kiri atas */}
        {badge && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Judul di bawah thumbnail */}
      {title && (
        <div className="px-2 py-2">
          <p className="text-zinc-800 text-sm font-medium leading-tight line-clamp-2">{title}</p>
        </div>
      )}
    </div>
  );
}

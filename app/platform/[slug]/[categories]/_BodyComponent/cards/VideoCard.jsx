import Image from "next/image";

/**
 * VideoCard — thumbnail landscape 16:9 dengan play button
 *
 * Props:
 *   src   : string  — URL YouTube atau path gambar lokal
 *   alt   : string
 *   title : string
 *   badge : string  — teks badge pojok kiri atas (opsional)
 */

function extractYouTubeId(url) {
  if (typeof url !== "string") return null;
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)\/?([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export default function VideoCard({ src, alt, title, badge }) {
  const ytId    = extractYouTubeId(src);
  const imgSrc  = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : (src || "/image/video.webp");
  const linkHref = ytId ? `https://www.youtube.com/watch?v=${ytId}` : (typeof src === "string" ? src : null);
  const isLocal = imgSrc.startsWith("/");

  const Wrapper = linkHref ? "a" : "div";
  const wrapperProps = linkHref
    ? { href: linkHref, target: "_blank", rel: "noopener noreferrer", "aria-label": title || alt || "Buka video" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group relative w-full overflow-hidden rounded-xl bg-zinc-100 border border-zinc-300 cursor-pointer block"
    >
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

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition">
            <svg className="w-5 h-5 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Badge */}
        {badge && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Judul */}
      {title && (
        <div className="px-2 py-2">
          <p className="text-zinc-800 text-sm font-medium leading-tight line-clamp-2">{title}</p>
        </div>
      )}
    </Wrapper>
  );
}

import Image from "next/image";

export default function InstagramPreviewCard({
  thumbnailUrl,
  alt = "Instagram preview",
  leftBadge,
  rightBadge,
  className = "",
}) {
  return (
    <div
      className={`relative w-full max-w-90 overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${className}`}
    >
      <div className="relative aspect-9/16 w-full bg-black/5">
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 360px, 80vw"
          className="object-cover"
          unoptimized
        />
      </div>

      {leftBadge ? (
        <div className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur">
          {leftBadge}
        </div>
      ) : null}

      {rightBadge ? (
        <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur">
          {rightBadge}
        </div>
      ) : null}
    </div>
  );
}

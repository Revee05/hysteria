import Link from "next/link";
import Image from "next/image";

export default function InstagramPostCard({
  href,
  thumbnailUrl,
  alt = "Instagram thumbnail",
}) {
  return (
    <Link href={href} className="group block" aria-label="Open post detail">
      <div className="relative aspect-9/16 w-full overflow-hidden rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          unoptimized
        />

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </div>
    </Link>
  );
}

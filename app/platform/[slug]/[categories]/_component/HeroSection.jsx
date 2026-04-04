"use client";
import Image from "next/image";

export default function TimHero({ imageUrl, title, description }) {
  const resolvedImage = imageUrl || "/image/tim-hero.png";
  const resolvedTitle = title || "Hysteria";
  const resolvedDescription = description || "Hysteria, Colaboratorium and Creative Impact Hub";
  const isLocalImage = resolvedImage.startsWith("/");

  return (
    <div suppressHydrationWarning={true} className="relative w-full h-[500px] md:h-[650px] bg-[#d9d9d9] flex flex-col justify-center items-center text-white overflow-hidden">
      {/* Background placeholder - in production this should probably be an image */}
      <div className="absolute inset-0">
        <Image
          src={resolvedImage}
          alt="Tim Hero Background"
          loading="lazy"
          fill
          unoptimized={!isLocalImage}
          className="object-cover brightness-50"
        />
      </div>

      {/* Left-aligned title/description like screenshot */}
      <div className="absolute z-10 left-6 md:left-24 top-5/9 w-full md:w-1/2 px-4 md:px-0 text-left gap-3">
        <h1 className="font-bold text-[32px] md:text-[40px] lg:text-[56px] leading-[1.1] font-poppins mb-4">{resolvedTitle}</h1>
        <p className="font-normal text-[14px] md:text-[18px] lg:text-[20px] leading-[1.6] font-poppins max-w-[680px]">{resolvedDescription}</p>
      </div>
    </div>
  );
}

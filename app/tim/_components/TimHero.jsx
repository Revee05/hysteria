"use client";
import Image from "next/image";

export default function TimHero({ imageUrl, title, subtitle }) {
  const resolvedImage = imageUrl || "/image/tim-hero.png";
  const resolvedTitle = title || "Tim Hysteria";
  const resolvedSubtitle = subtitle || "Hysteria , Colaboratorium and Creative Impact Hub";
  const isLocalImage = resolvedImage.startsWith("/");

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-[#d9d9d9] flex flex-col  justify-center items-center text-white overflow-hidden">
      {/* Background placeholder - in production this should probably be an image */}
      <div className="absolute inset-0">
        <Image
          src={resolvedImage}
          alt="Tim Hero Background"
          fill
          unoptimized={!isLocalImage}
          className="object-cover brightness-50"
        />
      </div>
      {/* <div className="absolute inset-0 bg-[url(/image/tim-hero.png)] bg-cover bg-center brightness-75">
        <div className="bg-white/30 backdrop-grayscale-0"></div>
      </div> */}

      <div className="relative z-10 text-center px-4 top-1/4">
        <h1 className="font-bold text-[40px] md:text-[64px] leading-[1.5] font-poppins mb-4">{resolvedTitle}</h1>
        <p className="font-normal text-[18px] md:text-[24px] leading-[1.5] font-poppins">{resolvedSubtitle}</p>
      </div>
    </div>
  );
}

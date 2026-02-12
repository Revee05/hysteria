"use client";
import { useRef } from "react";
import Image from "next/image";
import ProfileCard from "./ProfileCard";

export default function ProfileSlider({ profiles, title }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 450; // Approx card width + gap
      const newScrollLeft = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full py-16 relative">
      <div className="flex items-center justify-between mb-12 mx-auto px-4 md:px-24 max-w-[1920px]">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex w-[60px] h-[60px] bg-white rounded-full items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
          aria-label="Previous">
          <Image
            src="/svg/arrow-left.svg"
            alt="Previous"
            width={60}
            height={60}
          />
        </button>

        <h2 className="text-center font-bold text-[32px] md:text-[40px] leading-[1.5] text-black font-poppins">{title}</h2>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex w-[60px] h-[60px] bg-white rounded-full items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
          aria-label="Next">
          <Image
            src="/svg/arrow-right.svg"
            alt="Next"
            width={60}
            height={60}
          />
        </button>
      </div>

      <div className="relative w-full max-w-[1920px] mx-auto">
        <div
          ref={scrollContainerRef}
          className="flex gap-[35px] overflow-x-auto snap-x snap-mandatory pb-12 px-4 md:px-24 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {profiles.map((profile, index) => (
            <div
              key={index}
              className="flex-none w-[320px] md:w-[375px] snap-center">
              <ProfileCard {...profile} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

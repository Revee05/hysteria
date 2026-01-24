"use client";
import { useRef } from "react";
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
      <h2 className="text-center font-bold text-[32px] md:text-[40px] leading-[1.5] mb-12 text-black font-poppins">{title}</h2>

      <div className="relative w-full max-w-[1920px] mx-auto">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-10 hover:opacity-80 transition-opacity hidden md:block"
          aria-label="Previous">
          <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-10 hover:opacity-80 transition-opacity hidden md:block"
          aria-label="Next">
          <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 18L15 12L9 6"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 px-4 md:px-24 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {profiles.map((profile, index) => (
            <div
              key={index}
              className="flex-none w-[320px] md:w-[420px] snap-center">
              <ProfileCard {...profile} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Image from "next/image";

const SocialIcons = () => (
  <div className="relative w-[100px] h-[40px] mt-auto">
    {/* Using the image from Figma for now as it's a group of icons */}
    <Image
      src="https://www.figma.com/api/mcp/asset/55fbcb59-9e93-45f9-b7e7-c578ce41578a"
      alt="Socials"
      width={100}
      height={40}
      className="w-full h-full object-contain object-left"
    />
  </div>
);

export default function ProfileCard({ name, role, imageUrl }) {
  // Fallback image if none provided
  const imgSrc = imageUrl || "/image/placeholder-profile.png";

  return (
    <div className="flex flex-col items-start bg-white rounded-[10px] shadow-[0px_0px_20px_-3px_rgba(0,0,0,0.25)] overflow-hidden w-full max-w-[420px] h-full min-h-[500px] hover:shadow-xl transition-shadow duration-300">
      <div className="w-full aspect-[420/518] relative bg-gray-200 overflow-hidden">
        <Image
          src={imgSrc}
          alt={name}
          width={420}
          height={518}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-8 flex flex-col gap-2 w-full flex-1">
        <h3 className="font-bold text-[28px] md:text-[32px] leading-[1.5] text-black font-poppins">{name}</h3>
        <p className="font-normal text-[18px] md:text-[20px] leading-[1.5] text-[#e83c91] font-poppins mb-6">{role}</p>
        <SocialIcons />
      </div>
    </div>
  );
}

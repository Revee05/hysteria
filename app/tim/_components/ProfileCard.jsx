"use client";
import React from "react";
import Image from "next/image";
import { IconInstagram } from "../../../components/ui/icon";

const normalizeInstagram = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
};

const SocialIcons = ({ email, instagram }) => {
  const instagramUrl = normalizeInstagram(instagram);
  if (!email && !instagramUrl) return null;

  return (
    <div className="mt-auto flex items-center gap-3">
      {email ? (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
          aria-label={`Email ${email}`}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6h16v12H4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M4 7l8 6 8-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : null}

      {instagramUrl ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
          aria-label="Instagram">
          <IconInstagram className="w-4 h-4" />
        </a>
      ) : null}
    </div>
  );
};

export default function ProfileCard({ name, role, imageUrl, email, instagram }) {
  // Fallback image if none provided
  const imgSrc = imageUrl || "/image/placeholder-profile.png";

  return (
    <div className="flex flex-col items-start bg-white rounded-[10px] shadow-[0px_0px_20px_-3px_rgba(0,0,0,0.25)] overflow-hidden w-full max-w-[420px] h-full min-h-[500px] hover:shadow-xl transition-shadow duration-300">
      <div className="w-full aspect-[420/423] relative bg-gray-200 overflow-hidden">
        <Image
          src={imgSrc}
          alt={name}
          width={420}
          height={423}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-8 flex flex-col gap-2 w-full flex-1">
        <h3 className="font-bold text-[28px] md:text-[32px] leading-[1.5] text-black font-poppins">{name}</h3>
        <p className="font-normal text-[18px] md:text-[20px] leading-[1.5] text-[#e83c91] font-poppins mb-6">{role}</p>
        <SocialIcons
          email={email}
          instagram={instagram}
        />
      </div>
    </div>
  );
}

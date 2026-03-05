"use client";
import React from "react";
import Image from "next/image";
import { IconEnvelope, IconInstagram } from "../../../components/ui/icon";

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
    <div className="mt-auto flex items-center gap-2 md:gap-3">
      {email ? (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 text-zinc-900 hover:text-zinc-600"
          aria-label={`Email ${email}`}>
          <IconEnvelope className="w-8 h-8 md:w-9 md:h-9" />
        </a>
      ) : null}

      {instagramUrl ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 text-zinc-900 hover:text-zinc-600"
          aria-label="Instagram">
          <IconInstagram className="w-8 h-8 md:w-9 md:h-9" />
        </a>
      ) : null}
    </div>
  );
};

export default function ProfileCard({ name, role, imageUrl, email, instagram }) {
  // Fallback image if none provided
  const imgSrc = imageUrl || "/image/team-placeholder.webp";

  return (
    <div className="flex flex-col items-start bg-white rounded-[10px] shadow-[0px_0px_10px_-2px_rgba(0,0,0,0.15)] md:shadow-[0px_0px_20px_-3px_rgba(0,0,0,0.25)] overflow-hidden w-full max-w-[145px] md:max-w-[285px] h-full min-h-[250px] md:min-h-[445px] hover:shadow-xl transition-shadow duration-300">
      <div className="w-full aspect-square relative bg-gray-200 overflow-hidden">
        <Image
          src={imgSrc}
          alt={name}
          width={285}
          height={285}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 md:p-6 flex flex-col gap-0.5 md:gap-1 w-full flex-1">
        <h3 className="font-bold text-[14px] md:text-[24px] leading-tight md:leading-[1.5] text-black font-poppins">{name}</h3>
        <p className="font-normal text-[10px] md:text-[18px] leading-tight md:leading-[1.5] text-[#e83c91] font-poppins mb-3 md:mb-6">{role}</p>
        <SocialIcons
          email={email}
          instagram={instagram}
        />
      </div>
    </div>
  );
}

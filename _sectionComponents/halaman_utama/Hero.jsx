"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [processedSource, setProcessedSource] = useState(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    fetchActiveHero();
  }, []);

  const fetchActiveHero = async () => {
    try {
      const response = await fetch("/api/hero/active");
      const data = await response.json();
      if (data.success && data.data) {
        setHeroData(data.data);
      }
    } catch (error) {
      console.error("Error fetching hero:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultHero = {
    source:
      "image/ilustrasi-menu.png",
    title: "Media & Kolektif\nSeni-Budaya Alternatif",
    description:
      "Ruang ekspresi dan dokumentasi gerakan seni-budaya independen di Semarang",
  };

  const hero = heroData || defaultHero;
  const titleLines = hero.title.split("\n");

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  };

  // Convert Pexels page URL to direct media URL when possible
  const processPexelsUrl = (url) => {
    if (!url) return url;

    const videoMatch = url.match(/pexels\.com\/video\/[^/]+-([0-9]+)\/?/);
    if (videoMatch) {
      return url;
    }

    const photoMatch = url.match(/pexels\.com\/photo\/[^/]+-([0-9]+)\/?$/);
    if (photoMatch) {
      const photoId = photoMatch[1];
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
    }

    return url;
  };

  useEffect(() => {
    if (hero?.source) {
      const processed = processPexelsUrl(hero.source);
      setProcessedSource(processed);
    }
  }, [hero?.source]);

  if (loading) {
    return (
      <section className="relative w-full max-w-[1920px] h-[950px] overflow-hidden mx-auto bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative w-full max-w-[1920px] h-[700px] overflow-hidden mx-auto opacity-100">
      <div className="absolute inset-0 w-full h-full">
        {isVideo(processedSource || hero.source) && !mediaError ? (
          <video
            autoPlay
            loop
            muted={muted}
            playsInline
            controls={!muted}
            className="w-full h-full object-cover"
            onError={() => setMediaError(true)}
          >
            <source src={processedSource || hero.source} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={processedSource || hero.source}
            alt={hero.title}
            className="object-cover"
            fill
            onError={() => setMediaError(true)}
            unoptimized
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 h-full flex items-start pt-64 md:pt-72 lg:pt-[288px]">
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="w-full max-w-[700px] ml-0 sm:ml-8 md:ml-12 lg:ml-20 px-4 sm:px-0 text-left">
            <h1
              className="text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.05]"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              {titleLines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-6 text-[16px] sm:text-[20px] md:text-[24px] text-white/95 leading-relaxed">
              {hero.description}
            </p>
          </div>
        </div>
      </div>

      {isVideo(processedSource || hero.source) && (
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-16 md:bottom-24 right-6 z-20 bg-black/50 text-white px-3 py-2 rounded"
          aria-pressed={!muted}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      )}
    </section>
  );
}

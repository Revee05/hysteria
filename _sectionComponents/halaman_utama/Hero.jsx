"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconSpeaker } from "../../components/ui/icon.jsx";

export default function Hero() {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
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
    source: "/image/ilustrasi-menu.png",
    title: "Media & Kolektif\nSeni-Budaya Alternatif",
    description:
      "Ruang ekspresi dan dokumentasi gerakan seni-budaya independen di Semarang",
  };

  // Prefer DB-provided hero source; fall back to default only when DB has no source
  const hero = heroData && heroData.source ? heroData : defaultHero;
  const titleLines = (hero.title || "").split("\n");

  const isVideo = (url) => {
    if (!url) return false;
    const clean = url.split("?")[0];
    return /\.(mp4|webm|ogg)$/i.test(clean);
  };

  if (loading) {
    return (
      <section className="relative w-full max-w-[1920px] h-[700px] overflow-hidden mx-auto bg-zinc-900">
        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"></div>
        <div className="relative z-10 h-full flex items-start pt-64 md:pt-72 lg:pt-[288px]">
          <div className="w-full max-w-[700px] ml-0 sm:ml-8 md:ml-12 lg:ml-20 px-4 sm:px-0 text-left">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 sm:h-5 md:h-6 bg-white/10 rounded w-2/3"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const src = hero.source;

  return (
    <section className="relative w-full max-w-[1920px] h-[700px] overflow-hidden mx-auto opacity-100">
      <div className="absolute inset-0 w-full h-full">
        {isVideo(src) && !mediaError ? (
          <video
            autoPlay
            loop
            muted={muted}
            playsInline
            key={src}
            className="w-full h-full object-cover"
            onError={() => setMediaError(true)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "100%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <Image
            key={src}
            src={src}
            alt={hero.title || "Hero Image"}
            className="object-cover"
            fill
            priority
            onError={() => setMediaError(true)}
            unoptimized={src.startsWith("http")}
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

      {isVideo(src) && (
        <div className="absolute bottom-16 md:bottom-24 right-6 z-20">
          <IconSpeaker
            size={28}
            className="bg-black/50 text-white p-2 rounded cursor-pointer hover:bg-black/70 transition-colors"
            muted={muted}
            onChange={(nextMuted) => setMuted(nextMuted)}
          />
        </div>
      )}
      {/* Bottom gradient to transition smoothly into the next (white) section */}
      <div className="absolute bottom-0 left-0 right-0 h-8 md:h-20 z-30 pointer-events-none bg-linear-to-b from-transparent to-white" />
    </section>
  );
}

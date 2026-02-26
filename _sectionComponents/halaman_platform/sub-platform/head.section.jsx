"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IconSpeaker } from '../../components/ui/icon.jsx';
import { driveToEmbed, isDriveEmbed } from "../../lib/utils/drive.js";
import { isYouTube, getYouTubeId } from "../../lib/utils/youtube.js";

export default function Hero() {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [processedSource, setProcessedSource] = useState(null);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef(null);

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
      "/image/ilustrasi-menu.png",
      // "image/ilustrasi-menu.png",
    title: "Media & Kolektif\nSeni-Budaya Alternatif",
    description:
      "Ruang ekspresi dan dokumentasi gerakan seni-budaya independen di Semarang",
  };

  // Prefer DB-provided hero source; fall back to default only when DB has no source
  const hero = heroData && heroData.source ? heroData : defaultHero;
  const titleLines = hero.title.split("\n");

  const isVideo = (url) => {
    if (!url) return false;
    // Normalize and strip query params
    const clean = url.split('?')[0];
    // Common video extensions anywhere in the filename/path
    if (/\.(mp4|webm|ogg)$/i.test(clean)) return true;
    // Some uploaded paths may include the extension but in different positions
    if (clean.toLowerCase().includes('/uploads/') && /\.(mp4|webm|ogg)/i.test(clean)) return true;
    return false;
  };

  // Convert known providers (Pexels) and Google Drive to embedable sources
  const processExternalSource = (url) => {
    if (!url) return url;
    // pexels photo -> direct image
    const photoMatch = url.match(/pexels\.com\/photo\/[^/]+-([0-9]+)\/?$/);
    if (photoMatch) {
      const photoId = photoMatch[1];
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
    }
    // Google Drive -> convert to uc (images) or /preview (video)
    if (/drive\.google\.com/i.test(url)) {
      return driveToEmbed(url);
    }
    return url;
  };

  useEffect(() => {
    if (hero?.source) {
      // Reset media error so new source will be attempted
      setMediaError(false);
      const processed = processExternalSource(hero.source);
      setProcessedSource(processed);
    }
  }, [hero?.source]);

  // effective source to use (processed pexels or raw)
  const src = processedSource || hero.source;
  const ytId = isYouTube(src) ? getYouTubeId(src) : null;

  // send mute/unmute commands to youtube iframe player via postMessage
  useEffect(() => {
    if (!isYouTube(src) || !iframeRef.current) return;
    try {
      const cmd = muted ? "mute" : "unMute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: cmd, args: [] }),
        "*"
      );
    } catch (e) {
      // ignore
    }
  }, [muted, src]);

  if (loading) {
    return (
      <section className="relative w-full max-w-[1920px] h-[950px] overflow-hidden mx-auto bg-zinc-900">
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

  return (
    <section className="relative w-full max-w-[1920px] h-[700px] overflow-hidden mx-auto opacity-100">
      <div className="absolute inset-0 w-full h-full">
        {isYouTube(src) && !mediaError ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              ref={iframeRef}
              id="hero-youtube"
              key={src}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${ytId}&enablejsapi=1&playsinline=1`}
              title={hero.title}
              className="pointer-events-none"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              onError={() => setMediaError(true)}
              onLoad={() => {
                try {
                  // set initial mute/unmute without reloading
                  const cmd = muted ? "mute" : "unMute";
                  iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ event: "command", func: cmd, args: [] }),
                    "*"
                  );
                } catch (e) {}
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "177.78%",
                height: "100%",
                transform: "translate(-50%, -50%)",
                border: 0,
              }}
            />
          </div>
        ) : isDriveEmbed(src) && !mediaError ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              key={src}
              src={src}
              title={hero.title}
              className="pointer-events-none"
              allow="autoplay; fullscreen"
              allowFullScreen
              onError={() => setMediaError(true)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
                border: 0,
              }}
            />
          </div>
        ) : isVideo(src) && !mediaError ? (
          <video
            autoPlay
            loop
            muted={muted}
            playsInline
            controls={!muted}
            key={src}
            className="w-full h-full object-cover"
            onError={() => setMediaError(true)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <Image
            key={src}
            src={src}
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

      {(isVideo(src) || isYouTube(src) || isDriveEmbed(src)) && (
        <div className="absolute bottom-16 md:bottom-24 right-6 z-20">
          <IconSpeaker
            size={28}
            className="bg-black/50 text-white p-2 rounded"
            muted={muted}
            onChange={(nextMuted) => setMuted(nextMuted)}
          />
        </div>
      )}
      {/* Bottom gradient to transition smoothly into the next (white) section (reduced height) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 md:h-20 z-30 pointer-events-none bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

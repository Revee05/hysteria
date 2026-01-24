"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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

  // Detect YouTube links and extract video id
  const isYouTube = (url) => {
    if (!url) return false;
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const short = url.match(/youtu\.be\/([^?&/]+)/);
    if (short && short[1]) return short[1];
    const watch = url.match(/[?&]v=([^&]+)/);
    if (watch && watch[1]) return watch[1];
    const embed = url.match(/youtube\.com\/embed\/([^?&/]+)/);
    if (embed && embed[1]) return embed[1];
    return null;
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
      // Reset media error so new source will be attempted
      setMediaError(false);
      const processed = processPexelsUrl(hero.source);
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
      <section className="relative w-full max-w-[1920px] h-[950px] overflow-hidden mx-auto bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
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
              width: '177.78%',
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

      {(isVideo(src) || isYouTube(src)) && (
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

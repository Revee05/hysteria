import React from 'react'

export default function MediaSection({ youtubeProfile }) {
  // Convert various YouTube URL forms to an embeddable URL.
  // Returns null when URL cannot/should not be embedded (e.g., channel page).
  function toYouTubeEmbed(url) {
    if (!url) return null;
    try {
      // Ensure full URL
      let u = url.trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      // short share youtu.be/ID
      const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (short) return `https://www.youtube.com/embed/${short[1]}`;

      // watch?v=ID or &v=ID
      const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (watch) return `https://www.youtube.com/embed/${watch[1]}`;

      // already an embed URL
      if (u.includes('/embed/')) return u.startsWith('http') ? u : `https:${u}`;

      // If it's a channel or user page, we cannot embed the page due to X-Frame-Options.
      // Return null so caller can show a fallback link instead.
      if (u.includes('youtube.com/channel') || u.includes('youtube.com/user') || u.includes('youtube.com/c')) return null;

      // If it's the base youtube.com URL, treat as non-embedable
      if (/^https?:\/\/([^\/]+\.)?youtube\.com\/?$/i.test(u)) return null;

      // As a last resort, try to extract an 11-char id anywhere
      const any = u.match(/([a-zA-Z0-9_-]{11})/);
      if (any) return `https://www.youtube.com/embed/${any[1]}`;
    } catch (e) {
      return null;
    }
    return null;
  }

  const embedUrl = toYouTubeEmbed(youtubeProfile);
  return (
    <section className=" sm:py-12 md:py-16 lg:py-20 text-black">
      {/* Container: responsive max-width and padding for small/medium/large screens */}
      <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1920px] px-4 sm:px-6 md:px-8">
        {/* Center the player and limit its width on large viewports */}
        {youtubeProfile && (
          <div className="mx-auto w-full max-w-4xl">
            {/* Aspect-ratio wrapper (16:9). */}
            {embedUrl ? (
              <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute left-0 top-0 w-full h-full"
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 p-6 text-center shadow">
                <p className="mb-3 text-zinc-700">Konten YouTube tidak bisa di-embed.</p>
                <a
                  href={youtubeProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-pink-500 text-white px-4 py-2 rounded-md"
                >
                  Buka di YouTube
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

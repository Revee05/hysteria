"use client";

import { Facebook, Twitter, Instagram, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ShareButtons({ url, title }) {
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
      } catch {
        // user cancel
      }
    } else {
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </h3>

      <div className="flex gap-3">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share ke Facebook"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Facebook className="w-5 h-5" />
        </a>

        {/* X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share ke X"
          className="w-10 h-10 rounded-full
                     bg-black text-white
                     flex items-center justify-center
                     hover:bg-gray-800 transition"
        >
          <Twitter className="w-5 h-5" />
        </a>

        {/* Instagram */}
        <button
          onClick={shareNative}
          title="Share ke Instagram"
          className="w-10 h-10 rounded-full
                     bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400
                     text-white
                     flex items-center justify-center
                     hover:opacity-90 transition"
        >
          <Instagram className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

    const key = `viewed-${slug}`;

    try {
      const stored = localStorage.getItem(key);

      if (stored) {
        const { time } = JSON.parse(stored);
        const oneDay = 24 * 60 * 60 * 1000;

        if (Date.now() - time < oneDay) return;
      }
    } catch {
      localStorage.removeItem(key);
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles/${slug}/view`, {
          method: "POST",
          keepalive: true,
        });

        if (res.ok) {
          localStorage.setItem(
            key,
            JSON.stringify({
              time: Date.now(),
            })
          );
        }
      } catch (err) {
        console.error("View tracking failed:", err);
      }
    }, 5000); // user membaca minimal 5 detik

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
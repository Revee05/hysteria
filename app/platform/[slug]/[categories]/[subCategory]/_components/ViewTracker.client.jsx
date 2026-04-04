'use client';

import { useEffect, useRef } from 'react';

/**
 * ViewTracker — Client component yang bertugas mencatat statistik kunjungan.
 * Dipasang di halaman detail konten.
 *
 * Mencegah multiple hit dalam satu sesi menggunakan sessionStorage.
 */
export default function ViewTracker({ contentId }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!contentId || hasTracked.current) return;

    // Kunci unik per konten dan per sesi browser
    const sessionKey = `viewed_content_${contentId}`;
    const alreadyViewed = sessionStorage.getItem(sessionKey);

    if (!alreadyViewed) {
      // Tandai sudah diproses di memori (mencegah double render React StrictMode)
      hasTracked.current = true;

      // Jalankan hit ke API
      fetch(`/api/public/platform-content/${contentId}/view`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // Tandai di session storage agar refresh tidak menambah view
          sessionStorage.setItem(sessionKey, 'true');
        }
      })
      .catch(err => console.error('[ViewTracker] Error tracking view:', err));
    }
  }, [contentId]);

  return null; // Komponen ini tidak merender apa-apa di UI
}

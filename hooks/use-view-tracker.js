'use client';

import { useCallback } from 'react';

/**
 * useViewTracker — Hook untuk mencatat view ke API.
 * Digunakan untuk tracking klik pada link eksternal atau aksi lainnya.
 */
export function useViewTracker() {
  const trackView = useCallback(async (contentId) => {
    if (!contentId) return;

    // Kunci sesi (opsional: agar tidak double hit dalam waktu singkat)
    const sessionKey = `clicked_content_${contentId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    try {
      // Kita kirim request tanpa harus 'await' responnya lama-lama
      // agar user tidak merasa terhambat saat navigasi.
      fetch(`/api/public/platform-content/${contentId}/view`, {
        method: 'PATCH',
      }).then(() => {
        sessionStorage.setItem(sessionKey, 'true');
      });
    } catch (err) {
      console.error('[Hook][useViewTracker] Error:', err);
    }
  }, []);

  return { trackView };
}

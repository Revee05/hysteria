/**
 * YouTube URL utilities
 */

/**
 * Detect if a URL is a YouTube link
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isYouTube(url) {
  if (!url) return false;
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export function getYouTubeId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([^?&/]+)/);
  if (short && short[1]) return short[1];
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch && watch[1]) return watch[1];
  const embed = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embed && embed[1]) return embed[1];
  return null;
}

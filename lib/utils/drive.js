/**
 * Utilities to convert Google Drive links to embedable/direct URLs
 */

/**
 * Check if a URL is a Google Drive link
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com/i.test(url);
}

/**
 * Check if URL is a Google Drive preview/embed URL (should be rendered in iframe)
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isDriveEmbed(url) {
  if (!url || typeof url !== 'string') return false;
  // Only /preview URLs are embedable iframes (not /view)
  return /drive\.google\.com\/file\/d\/[^/]+\/preview/i.test(url);
}

export function driveToEmbed(url) {
  if (!url || typeof url !== 'string') return url;
  // Match common forms: /d/ID/, ?id=ID, open?id=ID
  const m =
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  const id = m && m[1];
  if (!id) return url;

  const lower = url.toLowerCase();
  const looksLikeImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lower);
  if (looksLikeImage) {
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  // For other media types prefer the preview endpoint which can be embedded in an iframe
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function driveToDirectDownload(url) {
  if (!url || typeof url !== 'string') return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const id = m && m[1];
  if (!id) return url;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

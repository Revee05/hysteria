export function extractMapSrc(input) {
  if (!input) return "";

  const value = input.trim();

  // ===== CASE 1: iframe =====
  if (value.includes("<iframe")) {
    const match = value.match(/src="([^"]+)"/);
    return match ? match[1] : "";
  }

  // ===== CASE 2: direct link =====
  if (value.startsWith("http")) {
    return value;
  }

  return "";
}

export function getPreviewSrc(input) {
  const src = extractMapSrc(input);

  if (!src) return null;

  // hanya tampilkan kalau embed maps
  if (!src.includes("google.com/maps/embed")) return null;

  return src;
}
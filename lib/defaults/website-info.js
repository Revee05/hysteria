export const DEFAULT_WEBSITE_INFO = {
  judul: "Hysteria",
  deskripsi: "Hysteria adalah ruang kolektif seni, riset, dan budaya yang berbasis di Semarang.",
  deskripsiFooter: "Hysteria adalah ruang kolektif seni, riset,\ndan budaya yang berbasis di Semarang.",
  logoWebsite: "/svg/Logo-hysteria.svg",
  faviconWebsite: "/svg/Logo-hysteria.svg",
};

function pickValue(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return value;
}

export function withWebsiteInfoDefaults(data = {}) {
  return {
    judul: pickValue(data.judul, DEFAULT_WEBSITE_INFO.judul),
    deskripsi: pickValue(data.deskripsi, DEFAULT_WEBSITE_INFO.deskripsi),
    deskripsiFooter: pickValue(data.deskripsiFooter, DEFAULT_WEBSITE_INFO.deskripsiFooter),
    logoWebsite: pickValue(data.logoWebsite, DEFAULT_WEBSITE_INFO.logoWebsite),
    faviconWebsite: pickValue(data.faviconWebsite, DEFAULT_WEBSITE_INFO.faviconWebsite),
  };
}

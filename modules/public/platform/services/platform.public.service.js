/**
 * platform.public.service.js
 *
 * Business logic untuk halaman platform publik.
 * Memakai repository sebagai sumber data, lalu memetakan ke bentuk
 * yang langsung dimakan oleh komponen halaman.
 */
import {
  findActivePlatformsWithCategories,
  findPublicPlatformBySlug,
  findGridContents,
  findCarouselSubCategories,
} from "../repositories/platform.public.repository.js";

// ─── DUMMY DATA (sementara) ───────────────────────────────────────────────────

/** TODO: hapus setelah Stonen 29 Radio Show tersedia di DB */
const STONEN_DUMMY_ITEMS = [
  { imageUrl: "/image/bakso_bakar.webp", alt: "Episode 1",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/artist.webp",      alt: "Episode 2",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp", alt: "Episode 3",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg", alt: "Episode 4",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp", alt: "Episode 5",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/artist.webp",      alt: "Episode 6",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp", alt: "Episode 7",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg", alt: "Episode 8",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp", alt: "Episode 9",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/artist.webp",      alt: "Episode 10", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp", alt: "Episode 11", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg", alt: "Episode 12", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Ambil cardType dari field meta JSON. Default "poster". */
function resolveCardType(meta) {
  if (!meta) return "poster";
  if (typeof meta === "string") return meta || "poster";
  if (typeof meta === "object") return meta.cardType || "poster";
  return "poster";
}

/** Inferensi cardType dari slug kategori, untuk fallback ketika meta belum diset di DB. */
function resolveCardTypeFromSlug(slug) {
  if (slug === "komik-ramuan") return "komik-ramuan";
  if (slug === "mockup-dan-poster" || slug === "mockup-poster") return "mockup";
  return "poster";
}

/** Petakan satu PlatformContent ke item kartu grid/poster. */
function mapToGridItem(content) {
  const img = content.images?.[0];
  return {
    imageUrl: img?.imageUrl ?? null,
    alt: img?.alt || content.title,
    title: content.title,
    prevdescription: content.prevdescription ?? null,
    description: content.description ?? null,
    tags: content.tags || [],
    year: content.year ? String(content.year) : null,
    meta: content.meta ?? (content.year ? String(content.year) : null),
    href: content.url ?? null,
    url: content.url || content.youtube || null,
  };
}

/** Petakan satu PlatformContent ke item kartu carousel sesuai cardType. */
function mapToCarouselItem(cardType, content) {
  const img = content.images?.[0];
  const base = {
    imageUrl: img?.imageUrl ?? null,
    alt: img?.alt || content.title,
    title: content.title,
    prevdescription: content.prevdescription ?? null,
    description: content.description ?? null,
    tags: content.tags || [],
    url: content.url ?? null,
  };

  if (cardType === "video") {
    return { ...base, host: content.host ?? null, guests: content.guests || [], youtube: content.youtube ?? null };
  }
  if (cardType === "artist") {
    return { ...base, host: content.host ?? null, guests: content.guests || [] };
  }
  // poster (default)
  return { ...base, meta: content.meta ?? (content.year ? String(content.year) : null) };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Daftar semua platform aktif beserta kategorinya.
 * Digunakan oleh generateStaticParams dan navigasi.
 *
 * Returns: Array<{ slug, head: { title, description }, categories: { title, slug, url }[] }>
 */
export async function listPublicPlatforms() {
  const platforms = await findActivePlatformsWithCategories();
  return platforms.map((p) => ({
    slug: p.slug,
    head: {
      title: p.headline || "",
      description: p.subHeadline || "",
    },
    categories: p.categories
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        title: c.categoryItem?.title || "",
        slug: c.categoryItem?.slug || "",
        url: c.categoryItem?.url || "",
      })),
  }));
}

/**
 * Data "head" sebuah platform — untuk HeroSection halaman platform.
 *
 * Returns: { head: { title, description, instagramUrl, youtubeUrl, images, multyImages }, mediaURL }
 *          atau null jika tidak ditemukan.
 */
export async function getPublicPlatform(slug) {
  const platform = await findPublicPlatformBySlug(slug);
  if (!platform) return null;

  const mainImages = (platform.images || [])
    .filter((img) => img.type === "main" && img.imageUrl)
    .sort((a, b) => a.order - b.order)
    .map((img) => ({
      src: img.imageUrl,
      alt: img.label || slug,
      title: img.title || null,
      subtitle: img.subtitle || null,
    }));

  const images =
    mainImages.length > 0
      ? mainImages
      : platform.mainImageUrl
      ? [{ src: platform.mainImageUrl, alt: platform.name || slug }]
      : [];

  return {
    head: {
      title: platform.headline || "",
      description: platform.subHeadline || "",
      instagramUrl: platform.instagram || "",
      youtubeUrl: platform.youtube || "",
      images,
      multyImages: images.length > 1,
    },
    mediaURL: platform.youtubeProfile || "",
  };
}

/**
 * Data sebuah kategori platform lengkap dengan kontennya.
 * Layout 'grid'     → { ..., items[], filters[] }
 * Layout 'carousel' → { ..., subCategories[] }
 *
 * Returns: kategori object atau null.
 */
export async function getPublicCategory(platformSlug, categorySlug) {
  const platform = await findPublicPlatformBySlug(platformSlug);
  if (!platform) return null;

  const sorted = (platform.categories || []).sort((a, b) => a.order - b.order);
  const catIndex = sorted.findIndex((c) => c.categoryItem?.slug === categorySlug);
  if (catIndex === -1) return null;

  const cat = sorted[catIndex];
  const catSlug = cat.categoryItem?.slug || "";

  // Hero image — matched by key, then fallback to cover image by index
  const heroImages = (platform.images || [])
    .filter((img) => img.type === "hero")
    .sort((a, b) => a.order - b.order);

  // Some hero keys in DB may use slightly different slugs (e.g. 'mockup-poster'
  // vs category slug 'mockup-dan-poster'). Try normalized variants to be
  // tolerant and avoid missing images due to small slug differences.
  const normalizedCat = (catSlug || "").replace(/-dan-/g, "-");

  const heroImage =
    heroImages.find((img) => img.key === `hero-${catSlug}`) ||
    heroImages.find((img) => img.key === `hero-${normalizedCat}`) ||
    heroImages.find((img) => img.key?.includes(catSlug)) ||
    heroImages.find((img) => img.key?.includes(normalizedCat)) ||
    null;

  const coverImages = (platform.images || [])
    .filter((img) => img.type === "cover" && img.imageUrl)
    .sort((a, b) => a.order - b.order);

  const image = heroImage?.imageUrl || coverImages[catIndex]?.imageUrl || platform.mainImageUrl || null;
  const imageTitle    = heroImage?.title    || null;
  const imageSubtitle = heroImage?.subtitle || null;

  const layout = cat.layout || "grid";

  const base = {
    title: cat.categoryItem.title,
    slug: cat.categoryItem.slug,
    url: cat.categoryItem.url || null,
    image,
    imageTitle,
    imageSubtitle,
    description: cat.description || "",
    layout,
  };

  if (layout === "grid") {
    const contents = await findGridContents(platform.id, cat.categoryItem.id);
    const items = contents.map(mapToGridItem);

    const filters = Array.isArray(cat.filters) && cat.filters.length > 0
      ? cat.filters
      : [...new Set(contents.flatMap((c) => c.tags || []))];

    return {
      ...base,
      cardType: resolveCardType(cat.categoryItem?.meta),
      filters,
      items,
      subCategories: [],
    };
  }

  // carousel
  const subs = await findCarouselSubCategories(platform.id, cat.categoryItem.id);

  // Fallback: jika tidak ada sub-kategori di DB, render sebagai grid
  if (subs.length === 0) {
    const contents = await findGridContents(platform.id, cat.categoryItem.id);
    const metaCardType = resolveCardType(cat.categoryItem?.meta);
    const resolvedCardType = metaCardType !== "poster"
      ? metaCardType
      : resolveCardTypeFromSlug(catSlug);
    const items = contents.map(mapToGridItem);
    const filters = [...new Set(contents.flatMap((c) => c.tags || []))];
    return {
      ...base,
      layout: "grid",
      cardType: resolvedCardType,
      filters,
      items,
      subCategories: [],
    };
  }

  const subCategories = subs.map((sub) => {
    if (sub.slug === "stonen-29-radio-show") {
      return { title: sub.title, slug: sub.slug, linkUrl: sub.url || null, cardType: "poster", items: STONEN_DUMMY_ITEMS };
    }

    // Ambil cardType dari meta PlatformContent pertama (bukan dari CategoryItem.meta)
    const cardType = resolveCardType(sub.platformContents?.[0]?.meta);
    return {
      title: sub.title,
      slug: sub.slug,
      linkUrl: sub.url || null,
      cardType,
      items: (sub.platformContents || []).map((c) => mapToCarouselItem(cardType, c)),
    };
  });

  return { ...base, filters: [], items: [], subCategories };
}

/**
 * Daftar kategori milik sebuah platform.
 * Digunakan oleh API route /api/platforms/[slug]/categories.
 *
 * Returns: Array<{ title, slug, url }> atau null jika platform tidak ada.
 */
export async function listPublicCategories(platformSlug) {
  const platform = await findPublicPlatformBySlug(platformSlug);
  if (!platform) return null;

  return (platform.categories || [])
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      title: c.categoryItem?.title || "",
      slug: c.categoryItem?.slug || "",
      url: c.categoryItem?.url || "",
    }));
}

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
  { imageUrl: "/image/bakso_bakar.webp",  alt: "Episode 1",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/artist.webp",       alt: "Episode 2",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp",  alt: "Episode 3",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg",  alt: "Episode 4",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp",  alt: "Episode 5",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/artist.webp",       alt: "Episode 6",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp",  alt: "Episode 7",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg",  alt: "Episode 8",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp",  alt: "Episode 9",  title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
  { imageUrl: "/image/artist.webp",       alt: "Episode 10", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Akan Berlangsung"],   meta: "Sabtu, 8 Maret 2026" },
  { imageUrl: "/image/DummyPoster.webp",  alt: "Episode 11", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Sedang Berlangsung"], meta: "Sabtu, 15 Maret 2026" },
  { imageUrl: "/image/bakso_malang.jpg",  alt: "Episode 12", title: "Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~", tags: ["Telah Berakhir"],     meta: "Sabtu, 22 Maret 2026" },
];

/**
 * Fallback cardType per slug — dipakai saat CategoryItem.meta.cardType belum diisi di DB.
 * TODO: hapus entry setelah meta diisi lewat admin panel.
 */
const SLUG_CARD_TYPE_FALLBACK = {
  "anitalk":      "video",
  "artist-radar": "artist",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Memetakan satu PlatformContent ke bentuk item kartu poster/grid.
 * { src, alt, title, subtitle, badge, meta, tag }
 */
function mapToGridItem(content) {
  const img = content.images?.[0];
  return {
    imageUrl: img?.imageUrl || null,
    alt: img?.alt || content.title,
    title: content.title,
    description: content.description || null,
    tags: content.tags || [],
    meta: content.year ? String(content.year) : null,
    url: content.url || content.youtube || null,
  };
}

/**
 * Memetakan satu PlatformContent ke bentuk item kartu carousel
 * sesuai cardType ('poster' | 'video' | 'artist').
 */
function mapToCarouselItem(cardType, content) {
  const img = content.images?.[0];

  if (cardType === "video") {
    return {
      imageUrl: img?.imageUrl || null,
      alt: img?.alt || content.title,
      title: content.title,
      description: content.description || null,
      timestamp: content.timestamp || null,
      host: content.host || null,
      guests: content.guests || [],
      tags: content.tags || [],
      youtube: content.youtube || null,
      url: content.url || null,
    };
  }

  if (cardType === "artist") {
    return {
      imageUrl: img?.imageUrl || null,
      alt: img?.alt || content.title,
      title: content.title,
      description: content.description || null,
      host: content.host || null,
      guests: content.guests || [],
      url: content.url,
      tags: content.tags || [],
    };
  }

  // default: poster
  return {
    imageUrl: img?.imageUrl || null,
    alt: img?.alt || content.title,
    title: content.title,
    description: content.description || null,
    tags: content.tags || [],
    meta: content.year ? String(content.year) : null,
    url: content.url || null,
  };
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

  // Urutkan kategori, lalu cari yang cocok
  const sorted = (platform.categories || []).sort(
    (a, b) => a.order - b.order
  );
  const catIndex = sorted.findIndex(
    (c) => c.categoryItem?.slug === categorySlug
  );
  if (catIndex === -1) return null;

  const cat = sorted[catIndex];

  // Hero image: PlatformImage type='hero', dicocokkan lewat key "hero-{categorySlug}"
  const heroImages = (platform.images || [])
    .filter((img) => img.type === "hero")
    .sort((a, b) => a.order - b.order);
  const catSlug = cat.categoryItem?.slug || "";
  const heroImage =
    heroImages.find((img) => img.key === `hero-${catSlug}`) ||
    heroImages.find((img) => img.key && img.key.includes(catSlug)) ||
    null;

  // Cover image: PlatformImage type='cover', dicocokkan lewat urutan index (fallback)
  const coverImages = (platform.images || [])
    .filter((img) => img.type === "cover" && img.imageUrl)
    .sort((a, b) => a.order - b.order);

  const image =
    heroImage?.imageUrl ||
    coverImages[catIndex]?.imageUrl ||
    platform.mainImageUrl ||
    null;
  const imageTitle    = heroImage?.title    || null;
  const imageSubtitle = heroImage?.subtitle || null;

  const layout = cat.layout || "grid";
  const filters = Array.isArray(cat.filters) ? cat.filters : [];

  let items = [];
  let subCategories = [];

  if (layout === "grid") {
    const contents = await findGridContents(platform.id, cat.categoryItem.id);
    items = contents.map(mapToGridItem);

    // Jika PlatformCategory belum punya daftar filter,
    // turunkan dari tag konten secara otomatis
    const activeFilters =
      filters.length > 0
        ? filters
        : (() => {
            const tagSet = new Set();
            contents.forEach((c) => (c.tags || []).forEach((t) => tagSet.add(t)));
            return Array.from(tagSet);
          })();

    return {
      title: cat.categoryItem.title,
      slug: cat.categoryItem.slug,
      url: cat.categoryItem.url || null,
      image,
      imageTitle,
      imageSubtitle,
      description: cat.description || "",
      layout,
      filters: activeFilters,
      items,
      subCategories: [],
    };
  }

  // carousel
  const subs = await findCarouselSubCategories(platform.id, cat.categoryItem.id);
  subCategories = subs.map((sub) => {
    const cardType =
      (sub.meta && typeof sub.meta === "object" ? sub.meta.cardType : null) ||
      SLUG_CARD_TYPE_FALLBACK[sub.slug] ||
      "poster";

    // Stonen 29 Radio Show — gunakan dummy data sampai konten tersedia di DB
    if (sub.slug === "stonen-29-radio-show") {
      return {
        title: sub.title,
        slug: sub.slug,
        linkUrl: sub.url || null,
        cardType: "poster",
        items: STONEN_DUMMY_ITEMS,
      };
    }

    return {
      title: sub.title,
      slug: sub.slug,
      linkUrl: sub.url || null,
      cardType,
      items: (sub.platformContents || []).map((c) =>
        mapToCarouselItem(cardType, c)
      ),
    };
  });

  return {
    title: cat.categoryItem.title,
    slug: cat.categoryItem.slug,
    url: cat.categoryItem.url || null,
    image,
    imageTitle,
    imageSubtitle,
    description: cat.description || "",
    layout,
    filters: [],
    items: [],
    subCategories,
  };
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

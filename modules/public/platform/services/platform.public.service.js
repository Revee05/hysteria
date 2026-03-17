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
  findContentById,
  findRelatedContents,
  findPublicEventsByCategorySlug,
  findPublicEventsByOrganizerSlug,
} from "../repositories/platform.public.repository.js";
import { getEventStatus, EVENT_STATUS_LABEL } from "@/lib/event-status.js";
// import { getEventStatus, EVENT_STATUS_LABEL } from "../../../lib/event-status.js";

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
    id: content.id,
    imageUrl: img?.imageUrl ?? null,
    alt: img?.alt || content.title,
    title: content.title,
    prevdescription: content.prevdescription ?? null,
    description: content.description ?? null,
    host: content.host ?? null,
    guests: content.guests || [],
    tags: content.tags || [],
    year: content.year ? String(content.year) : null,
    meta: content.meta ?? (content.year ? String(content.year) : null),
    badge: content.badge ?? (Array.isArray(content.tags) && content.tags.length ? content.tags[0] : null),
    url: content.url || content.youtube || null,
  };
}

/** Petakan satu PlatformContent ke item kartu carousel sesuai cardType. */
function mapToCarouselItem(cardType, content) {
  const img = content.images?.[0];
  const base = {
    id: content.id,
    imageUrl: img?.imageUrl ?? null,
    alt: img?.alt || content.title,
    title: content.title,
    prevdescription: content.prevdescription ?? null,
    description: content.description ?? null,
    tags: content.tags || [],
    badge: content.badge ?? (Array.isArray(content.tags) && content.tags.length ? content.tags[0] : null),
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

/**
 * Format tanggal ke format Indonesia: "Senin, 1 Januari 2026".
 */
function formatIndonesianDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
      .sort((a, b) => b.order - a.order)
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
    .sort((a, b) => b.order - a.order)
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
    .sort((a, b) => b.order - a.order);

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
    .sort((a, b) => b.order - a.order);

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

  // Sub-kategori yang datanya bersumber dari model Event (bukan PlatformContent)
  const EVENT_DRIVEN_SUBCATEGORY_SLUGS = new Set([
    "stonen-29-radio-show",
    "workshop-artlab",
    "screening-film",
    "untuk-perhatian",
  ]);

  const subCategories = await Promise.all(
    subs.map(async (sub) => {
      // Ambil cardType dari meta CategoryItem, fallback ke meta PlatformContent pertama
      const cardType = resolveCardType(sub.meta) !== "poster"
        ? resolveCardType(sub.meta)
        : resolveCardType(sub.platformContents?.[0]?.meta);

      let items;
      if (EVENT_DRIVEN_SUBCATEGORY_SLUGS.has(sub.slug)) {
        items = await getPublicEventItems(sub.slug);
      } else {
        items = (sub.platformContents || []).map((c) => mapToCarouselItem(cardType, c));
      }

      // Resolve hero image untuk sub-kategori ini.
      // Strategi: exact match → normalized exact → semua bagian key ada di slug sub.
      // Contoh: key "hero-stonen-radio" cocok dengan slug "stonen-29-radio-show"
      // karena "stonen" dan "radio" keduanya ada di slug tersebut.
      const subSlug = sub.slug || "";
      const normalizedSubSlug = subSlug.replace(/-dan-/g, "-");
      const subHeroImage =
        heroImages.find((img) => img.key === `hero-${subSlug}`) ||
        heroImages.find((img) => img.key === `hero-${normalizedSubSlug}`) ||
        heroImages.find((img) => {
          if (!img.key) return false;
          const parts = img.key.replace("hero-", "").split("-").filter(Boolean);
          return parts.length > 0 && parts.every((part) => subSlug.includes(part));
        }) ||
        null;

      return {
        title: sub.title,
        slug: sub.slug,
        linkUrl: sub.url || null,
        cardType,
        items,
        heroImage: subHeroImage?.imageUrl || null,
        heroTitle: subHeroImage?.title || null,
        heroSubtitle: subHeroImage?.subtitle || null,
      };
    })
  );

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
    .sort((a, b) => b.order - a.order)
    .map((c) => ({
      title: c.categoryItem?.title || "",
      slug: c.categoryItem?.slug || "",
      url: c.categoryItem?.url || "",
    }));
}

/**
 * Data satu konten platform beserta konten terkait lainnya di sub-kategori yang sama.
 * Digunakan oleh halaman detail `/platform/[slug]/[categories]/[subCategory]/[id]`.
 *
 * Returns: { item, related[] } atau null jika tidak ditemukan.
 */
export async function getPublicContentItem(id) {
  const content = await findContentById(id);
  if (!content) return null;

  const related = content.categoryItem?.id && content.platform?.id
    ? await findRelatedContents(content.platform.id, content.categoryItem.id, content.id)
    : [];

  const mapItem = (c) => {
    const img = c.images?.[0];
    return {
      id: c.id,
      imageUrl: img?.imageUrl ?? null,
      alt: img?.alt || c.title,
      title: c.title,
      prevdescription: c.prevdescription ?? null,
      description: c.description ?? null,
      host: c.host ?? null,
      guests: c.guests || [],
      tags: c.tags || [],
      youtube: c.youtube ?? null,
      instagram: c.instagram ?? null,
      url: c.url ?? null,
    };
  };

  return {
    item: mapItem({ ...content, images: content.images }),
    related: related.map(mapItem),
  };
}

/**
 * Mengambil event publik untuk sebuah sub-kategori yang datanya bersumber dari
 * model Event (bukan PlatformContent). Contoh: stonen-29-radio-show.
 *
 * Returns: Array item siap pakai untuk GenericSubCategorySection / PosterCard.
 */
export async function getPublicEventItems(categorySlug) {
  const events = await findPublicEventsByCategorySlug(categorySlug);
  return events.map((event) => {
    const status = getEventStatus(event.startAt, event.endAt);
    // Derive sub-category tag: the eventCategories slug that is NOT the parent categorySlug
    const subCategorySlug =
      (event.eventCategories || [])
        .map((ec) => ec.categoryItem?.slug)
        .find((s) => s && s !== categorySlug) ?? null;
    return {
      id: event.id,
      slug: event.slug,
      imageUrl: event.poster ?? null,
      alt: event.title,
      title: event.title,
      description: event.description ?? null,
      badge: EVENT_STATUS_LABEL[status] ?? null,
      meta: formatIndonesianDate(event.startAt),
      tag: subCategorySlug,
      tags: (event.tags || []).map((t) => t.tag?.name).filter(Boolean),
    };
  });
}

/**
 * Mengambil event publik untuk kategori yang datanya bersumber dari organizer
 * (contoh: event-ditampart → organizer slug "ditampart").
 *
 * Returns: Array item siap pakai untuk GridBody / PosterCard.
 */
export async function getPublicEventItemsByOrganizer(organizerSlug) {
  const events = await findPublicEventsByOrganizerSlug(organizerSlug);
  return events.map((event) => {
    const status = getEventStatus(event.startAt, event.endAt);
    return {
      id: event.id,
      slug: event.slug,
      imageUrl: event.poster ?? null,
      alt: event.title,
      title: event.title,
      description: event.description ?? null,
      badge: EVENT_STATUS_LABEL[status] ?? null,
      meta: formatIndonesianDate(event.startAt),
      tags: (event.tags || []).map((t) => t.tag?.name).filter(Boolean),
    };
  });
}

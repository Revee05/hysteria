/**
 * platform.public.repository.js
 *
 * Layer database untuk halaman publik platform.
 * Hanya berisi operasi Prisma read-only — tidak ada mutasi di sini.
 */
import { prisma } from "@/lib/prisma.js";

// ─── SELECT SHAPES ──────────────────────────────────────────────────────────

const PLATFORM_SELECT = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  subHeadline: true,
  instagram: true,
  youtube: true,
  youtubeProfile: true,
  mainImageUrl: true,
  images: {
    where: { type: { in: ["main", "cover", "hero"] } },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { key: true, type: true, label: true, title: true, subtitle: true, imageUrl: true },
  },
  categories: {
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: {
      layout: true,
      //   description: true,
      //   filters: true,
      //   order: true,
      //   isActive: true,
      categoryItem: {
        select: { id: true, title: true, slug: true, url: true, meta: true },
      },
    },
  },
};

const CONTENT_SELECT = {
  id: true,
  title: true,
  prevdescription: true,
  description: true,
  url: true,
  youtube: true,
  host: true,
  guests: true,
  year: true,
  meta: true,
  tags: true,
  createdAt: true,
  images: {
    orderBy: [{ order: "asc" }, { id: "asc" }],
    take: 1,
    select: { imageUrl: true, alt: true, type: true },
  },
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/**
 * Mengambil semua platform aktif beserta daftar kategorinya.
 * Digunakan untuk generateStaticParams dan navigasi.
 */
export async function findActivePlatformsWithCategories() {
  return prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
    select: {
      slug: true,
      headline: true,
      subHeadline: true,
      categories: {
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          order: true,
          categoryItem: {
            select: { id: true, title: true, slug: true, url: true },
          },
        },
      },
    },
  });
}

/**
 * Mengambil satu platform aktif beserta gambar (main & cover) dan semua kategorinya.
 * @param {string} slug
 */
export async function findPublicPlatformBySlug(slug) {
  return prisma.platform.findFirst({
    where: { slug, isActive: true },
    select: PLATFORM_SELECT,
  });
}

/**
 * Mengambil semua PlatformContent (flat / grid) yang tertaut ke sebuah categoryItem.
 * @param {number} platformId
 * @param {number} categoryItemId
 */
export async function findGridContents(platformId, categoryItemId) {
  return prisma.platformContent.findMany({
    where: { platformId, categoryItemId, isActive: true },
    orderBy: [{ createdAt: "desc" }],
    select: CONTENT_SELECT,
  });
}

/**
 * Mengambil satu PlatformContent berdasarkan ID-nya.
 * @param {number} id
 */
export async function findContentById(id) {
  return prisma.platformContent.findFirst({
    where: { id: Number(id), isActive: true },
    select: {
      ...CONTENT_SELECT,
      instagram: true,
      categoryItem: {
        select: { id: true, title: true, slug: true },
      },
      platform: {
        select: { id: true, slug: true },
      },
    },
  });
}

/**
 * Mengambil konten lain dalam sub-kategori yang sama (untuk "Konten Lainnya").
 * @param {number} platformId
 * @param {number} categoryItemId
 * @param {number} excludeId  — ID konten yang sedang ditampilkan
 */
export async function findRelatedContents(platformId, categoryItemId, excludeId) {
  return prisma.platformContent.findMany({
    where: { platformId, categoryItemId, isActive: true, id: { not: excludeId } },
    orderBy: [{ createdAt: "desc" }],
    take: 4,
    select: CONTENT_SELECT,
  });
}

/**
 * Mengambil semua event publik (isPublished = true) berdasarkan slug organizer CategoryItem.
 * Digunakan untuk kategori yang sumber datanya dari organizer (contoh: event-ditampart).
 * @param {string} organizerSlug
 */
export async function findPublicEventsByOrganizerSlug(organizerSlug) {
  return prisma.event.findMany({
    where: {
      isPublished: true,
      organizers: {
        some: { categoryItem: { slug: organizerSlug } },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      poster: true,
      description: true,
      startAt: true,
      endAt: true,
      createdAt: true,
      tags: {
        include: { tag: { select: { id: true, name: true } } },
      },
    },
  });
}

/**
 * Mengambil semua event publik (isPublished = true) berdasarkan slug CategoryItem event.
 * Digunakan oleh halaman subCategory yang kontennya bersumber dari model Event
 * (contoh: stonen-29-radio-show, workshop-artlab, dll.).
 * @param {string} categorySlug
 */
export async function findPublicEventsByCategorySlug(categorySlug) {
  return prisma.event.findMany({
    where: {
      isPublished: true,
      eventCategories: {
        some: { categoryItem: { slug: categorySlug } },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      poster: true,
      description: true,
      startAt: true,
      endAt: true,
      createdAt: true,
      tags: {
        include: { tag: { select: { id: true, name: true } } },
      },
      eventCategories: {
        select: { categoryItem: { select: { slug: true } } },
      },
    },
  });
}

/**
 * Mengambil sub-kategori carousel beserta kontennya.
 * Sub-kategori = CategoryItem yang parentId-nya adalah parentCategoryItemId.
 * Setiap sub-kategori menyertakan PlatformContent milik platform ini.
 * @param {number} platformId
 * @param {number} parentCategoryItemId
 */
export async function findCarouselSubCategories(platformId, parentCategoryItemId) {
  return prisma.categoryItem.findMany({
    where: { parentId: parentCategoryItemId, isActive: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      url: true,
      meta: true, // { cardType: 'poster' | 'video' | 'artist' }
      platformContents: {
        where: { platformId, isActive: true },
        orderBy: [{ createdAt: "desc" }],
        select: CONTENT_SELECT,
      },
    },
  });
}

/**
 * Mengambil konfigurasi kartu platform untuk homepage.
 */
export async function findActiveHomepagePlatformCards() {
  return prisma.homepagePlatformCard.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      linkUrl: true,
      slotType: true,
      order: true,
      isActive: true,
    },
  });
}

/**
 * Atomic increment views untuk konten platform.
 * Digunakan oleh tracker publik.
 * @param {number} id
 */
export async function incrementContentView(id) {
  return prisma.platformContent.update({
    where: { id: Number(id) },
    data: { views: { increment: 1 } },
  });
}

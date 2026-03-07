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
      id: true,
      layout: true,
    //   description: true,
    //   filters: true,
    //   order: true,
    //   isActive: true,
      categoryItem: {
        select: { id: true, title: true, slug: true, url: true },
      },
    },
  },
};

const CONTENT_SELECT = {
  id: true,
  title: true,
  description: true,
  url: true,
  youtube: true,
  instagram: true,
  host: true,
  guests: true,
  year: true,
  tags: true,
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
      id: true,
      slug: true,
      name: true,
      headline: true,
      subHeadline: true,
      categories: {
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          order: true,
          isActive: true,
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
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: CONTENT_SELECT,
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
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: CONTENT_SELECT,
      },
    },
  });
}

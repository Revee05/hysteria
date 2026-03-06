/**
 * platformContent.repository.js
 *
 * Layer database untuk PlatformContent dan PlatformContentImage.
 * Hanya berisi operasi Prisma — tidak ada business logic di sini.
 */
import { prisma } from "../../../../lib/prisma.js";

/** Include standar: sertakan images dan categoryItem setiap kali query konten. */
const CONTENT_INCLUDE = {
  images: { orderBy: [{ order: "asc" }, { id: "asc" }] },
  categoryItem: { select: { id: true, title: true, slug: true, url: true } },
};

// ─── PLATFORM CONTENT ────────────────────────────────────────────────────────

/**
 * Ambil semua konten berdasarkan platformId, dengan filter opsional categoryItemId.
 * Diurutkan berdasarkan order ASC, lalu id ASC.
 * @param {number} platformId
 * @param {number|null} [categoryItemId]
 * @returns {Promise<PlatformContent[]>}
 */
export async function findContentsByPlatformId(platformId, categoryItemId = null) {
  const where = { platformId };
  if (categoryItemId !== null) where.categoryItemId = categoryItemId;
  return prisma.platformContent.findMany({
    where,
    include: CONTENT_INCLUDE,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/**
 * Ambil semua konten berdasarkan platform slug, dengan filter opsional categoryItem slug.
 * Prisma melakukan JOIN langsung — tidak perlu lookup platformId terpisah.
 * @param {string} platformSlug
 * @param {string|null} [categoryItemSlug]
 * @returns {Promise<PlatformContent[]>}
 */
export async function findContentsByPlatformSlug(platformSlug, categoryItemSlug = null) {
  const where = { platform: { slug: platformSlug } };
  if (categoryItemSlug) where.categoryItem = { slug: categoryItemSlug };
  return prisma.platformContent.findMany({
    where,
    include: CONTENT_INCLUDE,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/**
 * Ambil id integer Platform dari slug-nya.
 * Digunakan saat membuat konten baru dengan platformSlug bukan platformId.
 * @param {string} slug
 * @returns {Promise<number|null>}
 */
export async function findPlatformIdBySlug(slug) {
  const p = await prisma.platform.findUnique({ where: { slug }, select: { id: true } });
  return p?.id ?? null;
}

/**
 * Ambil id integer CategoryItem dari slug-nya.
 * Digunakan saat membuat konten baru dengan categoryItemSlug bukan categoryItemId.
 * @param {string} slug
 * @returns {Promise<number|null>}
 */
export async function findCategoryItemIdBySlug(slug) {
  const item = await prisma.categoryItem.findFirst({ where: { slug }, select: { id: true } });
  return item?.id ?? null;
}

/**
 * Ambil satu konten beserta images dan categoryItem berdasarkan id.
 * @param {number} id
 * @returns {Promise<PlatformContent|null>}
 */
export async function findContentById(id) {
  return prisma.platformContent.findUnique({ where: { id }, include: CONTENT_INCLUDE });
}

/**
 * Buat konten baru.
 * @param {object} data - { platformId, title, url?, year?, tags?, order?, isActive?, categoryItemId? }
 * @returns {Promise<PlatformContent>}
 */
export async function createContent(data) {
  return prisma.platformContent.create({ data, include: CONTENT_INCLUDE });
}

/**
 * Update partial konten berdasarkan id.
 * @param {number} id
 * @param {object} data - field yang ingin diubah saja
 * @returns {Promise<PlatformContent>}
 */
export async function updateContentById(id, data) {
  return prisma.platformContent.update({ where: { id }, data, include: CONTENT_INCLUDE });
}

/**
 * Hapus konten berdasarkan id (cascade menghapus images otomatis).
 * @param {number} id
 * @returns {Promise<PlatformContent>}
 */
export async function deleteContentById(id) {
  return prisma.platformContent.delete({ where: { id } });
}

// ─── PLATFORM CONTENT IMAGE ──────────────────────────────────────────────────

/**
 * Ambil semua gambar milik satu konten.
 * @param {number} contentId
 * @returns {Promise<PlatformContentImage[]>}
 */
export async function findImagesByContentId(contentId) {
  return prisma.platformContentImage.findMany({
    where: { contentId },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/**
 * Ambil satu gambar berdasarkan id.
 * @param {number} id
 * @returns {Promise<PlatformContentImage|null>}
 */
export async function findImageById(id) {
  return prisma.platformContentImage.findUnique({ where: { id } });
}

/**
 * Tambah gambar ke konten.
 * @param {object} data - { contentId, imageUrl?, type?, alt?, order? }
 * @returns {Promise<PlatformContentImage>}
 */
export async function createImage(data) {
  return prisma.platformContentImage.create({ data });
}

/**
 * Update partial gambar berdasarkan id.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<PlatformContentImage>}
 */
export async function updateImageById(id, data) {
  return prisma.platformContentImage.update({ where: { id }, data });
}

/**
 * Hapus gambar berdasarkan id.
 * @param {number} id
 * @returns {Promise<PlatformContentImage>}
 */
export async function deleteImageById(id) {
  return prisma.platformContentImage.delete({ where: { id } });
}

/**
 * platformContent.service.js
 *
 * Business logic untuk PlatformContent dan PlatformContentImage.
 * Duduk di antara API route dan repository.
 */
import { AppError } from "../../../../lib/response.js";
import { logInfo, logWarning, logError } from "../../../../lib/api-logger.js";
import {
  findContentsByPlatformId,
  findContentsByPlatformSlug,
  findContentById,
  findPlatformIdBySlug,
  findCategoryItemIdBySlug,
  createContent,
  updateContentById,
  deleteContentById,
  findImagesByContentId,
  findImageById,
  createImage,
  updateImageById,
  deleteImageById,
} from "../repository/platformContent.repository.js";
import {
  createContentSchema,
  updateContentSchema,
  createContentImageSchema,
  updateContentImageSchema,
  validateContentData,
} from "../validators/platformContent.validator.js";

/**
 * Ambil semua konten milik sebuah platform via slug.
 * Tidak perlu platformId — Prisma JOIN langsung dari slug.
 * @param {string} platformSlug
 * @param {string|null} [categoryItemSlug]
 */
export async function listPlatformContentsBySlug(platformSlug, categoryItemSlug = null) {
  if (!platformSlug || typeof platformSlug !== "string") {
    throw new AppError("platformSlug tidak valid", 400, "VALIDATION_ERROR");
  }
  logInfo("[PlatformContent][Service][LIST_BY_SLUG] Start", { platformSlug, categoryItemSlug });
  const contents = await findContentsByPlatformSlug(platformSlug, categoryItemSlug || null);
  logInfo("[PlatformContent][Service][LIST_BY_SLUG] Success", { platformSlug, count: contents.length });
  return contents;
}

/**
 * Ambil semua konten milik sebuah platform, dengan filter opsional categoryItemId.
 * @param {number|string} platformId
 * @param {number|string|null} [categoryItemId]
 */
export async function listPlatformContents(platformId, categoryItemId = null) {
  const id = parseInt(platformId, 10);
  if (!id || isNaN(id)) throw new AppError("platformId tidak valid", 400, "VALIDATION_ERROR");

  const catId = categoryItemId ? parseInt(categoryItemId, 10) : null;
  if (categoryItemId && isNaN(catId)) throw new AppError("categoryItemId tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][LIST] Start", { platformId: id, categoryItemId: catId });
  const contents = await findContentsByPlatformId(id, catId);
  logInfo("[PlatformContent][Service][LIST] Success", { platformId: id, count: contents.length });
  return contents;
}

// â”€â”€â”€ GET SINGLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Ambil satu konten beserta images dan categoryItem.
 * @param {number|string} id
 */
export async function getPlatformContent(id) {
  const numId = parseInt(id, 10);
  if (!numId || isNaN(numId)) throw new AppError("id konten tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][GET] Start", { id: numId });
  const content = await findContentById(numId);
  if (!content) throw new AppError(`Konten dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  logInfo("[PlatformContent][Service][GET] Success", { id: numId });
  return content;
}

// â”€â”€â”€ CREATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Buat konten baru.
 * @param {object} data - { platformId, title, url?, year?, tags?, order?, isActive?, categoryItemId? }
 */
export async function createPlatformContent(data) {
  logInfo("[PlatformContent][Service][CREATE] Start", { dataKeys: Object.keys(data || {}) });

  // Jika frontend kirim platformSlug bukan platformId, resolve dulu
  let inputData = { ...data };
  if (!inputData.platformId && inputData.platformSlug) {
    const resolvedId = await findPlatformIdBySlug(inputData.platformSlug);
    if (!resolvedId) throw new AppError(`Platform '${inputData.platformSlug}' tidak ditemukan`, 404, "NOT_FOUND");
    inputData.platformId = resolvedId;
    delete inputData.platformSlug;
  }

  // Jika frontend kirim categoryItemSlug bukan categoryItemId, resolve dulu
  if (!inputData.categoryItemId && inputData.categoryItemSlug) {
    const resolvedCatId = await findCategoryItemIdBySlug(inputData.categoryItemSlug);
    if (!resolvedCatId) throw new AppError(`CategoryItem '${inputData.categoryItemSlug}' tidak ditemukan`, 404, "NOT_FOUND");
    inputData.categoryItemId = resolvedCatId;
    delete inputData.categoryItemSlug;
  }

  let validated;
  try {
    validated = validateContentData(inputData, createContentSchema);
  } catch (error) {
    logWarning("[PlatformContent][Service][CREATE] Validation failed", { error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Data tidak valid", 400, "VALIDATION_ERROR");
  }

  const content = await createContent(validated);
  logInfo("[PlatformContent][Service][CREATE] Success", { id: content.id });
  return content;
}

// â”€â”€â”€ UPDATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Update sebagian field konten.
 * @param {number|string} id
 * @param {object} data
 */
export async function updatePlatformContent(id, data) {
  const numId = parseInt(id, 10);
  if (!numId || isNaN(numId)) throw new AppError("id konten tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][UPDATE] Start", { id: numId, dataKeys: Object.keys(data || {}) });

  let validated;
  try {
    validated = validateContentData(data, updateContentSchema);
  } catch (error) {
    logWarning("[PlatformContent][Service][UPDATE] Validation failed", { id: numId, error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Data tidak valid", 400, "VALIDATION_ERROR");
  }

  const existing = await findContentById(numId);
  if (!existing) throw new AppError(`Konten dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  const payload = Object.fromEntries(Object.entries(validated).filter(([, v]) => v !== undefined));
  const updated = await updateContentById(numId, payload);
  logInfo("[PlatformContent][Service][UPDATE] Success", { id: numId });
  return updated;
}

// â”€â”€â”€ DELETE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Hapus konten (cascade menghapus images).
 * @param {number|string} id
 */
export async function deletePlatformContent(id) {
  const numId = parseInt(id, 10);
  if (!numId || isNaN(numId)) throw new AppError("id konten tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][DELETE] Start", { id: numId });
  const existing = await findContentById(numId);
  if (!existing) throw new AppError(`Konten dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  await deleteContentById(numId);
  logInfo("[PlatformContent][Service][DELETE] Success", { id: numId });
}

// â”€â”€â”€ IMAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Tambah gambar ke konten.
 * @param {number|string} contentId
 * @param {object} data - { imageUrl?, type?, alt?, order? }
 */
export async function addContentImage(contentId, data) {
  const numId = parseInt(contentId, 10);
  if (!numId || isNaN(numId)) throw new AppError("contentId tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][IMAGE:ADD] Start", { contentId: numId });

  const existing = await findContentById(numId);
  if (!existing) throw new AppError(`Konten dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  let validated;
  try {
    validated = validateContentData({ ...data, contentId: numId }, createContentImageSchema);
  } catch (error) {
    logWarning("[PlatformContent][Service][IMAGE:ADD] Validation failed", { error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Data gambar tidak valid", 400, "VALIDATION_ERROR");
  }

  const image = await createImage(validated);
  logInfo("[PlatformContent][Service][IMAGE:ADD] Success", { imageId: image.id });
  return image;
}

/**
 * Update gambar konten.
 * @param {number|string} imageId
 * @param {object} data
 */
export async function updateContentImage(imageId, data) {
  const numId = parseInt(imageId, 10);
  if (!numId || isNaN(numId)) throw new AppError("imageId tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][IMAGE:UPDATE] Start", { imageId: numId });

  const existing = await findImageById(numId);
  if (!existing) throw new AppError(`Gambar dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  let validated;
  try {
    validated = validateContentData(data, updateContentImageSchema);
  } catch (error) {
    logWarning("[PlatformContent][Service][IMAGE:UPDATE] Validation failed", { error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Data gambar tidak valid", 400, "VALIDATION_ERROR");
  }

  const payload = Object.fromEntries(Object.entries(validated).filter(([, v]) => v !== undefined));
  const updated = await updateImageById(numId, payload);
  logInfo("[PlatformContent][Service][IMAGE:UPDATE] Success", { imageId: numId });
  return updated;
}

/**
 * Hapus gambar konten.
 * @param {number|string} imageId
 */
export async function removeContentImage(imageId) {
  const numId = parseInt(imageId, 10);
  if (!numId || isNaN(numId)) throw new AppError("imageId tidak valid", 400, "VALIDATION_ERROR");

  logInfo("[PlatformContent][Service][IMAGE:DELETE] Start", { imageId: numId });

  const existing = await findImageById(numId);
  if (!existing) throw new AppError(`Gambar dengan id '${numId}' tidak ditemukan`, 404, "NOT_FOUND");

  await deleteImageById(numId);
  logInfo("[PlatformContent][Service][IMAGE:DELETE] Success", { imageId: numId });
}

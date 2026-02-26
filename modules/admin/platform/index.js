/**
 * Platform module — entry point
 *
 * Mengelola metadata halaman platform (headline, social links, mainImageUrl) dan
 * semua slot gambar (cover + hero) yang terhubung ke setiap platform.
 *
 * Struktur folder:
 *   repositories/   → akses DB langsung (raw SQL)
 *   services/       → business logic + upload handling
 *   validators/     → Zod schema untuk input validation
 *   cover/          → sub-modul khusus cover image (type="cover")
 *
 * Platform yang tersedia saat ini: artlab, ditampart, laki-masak
 */

import * as platformService from "./services/platform.service.js";

// Re-export semua symbol agar konsumen tidak perlu tahu struktur internal folder
export * from "./services/platform.service.js";
export * from "./repositories/platform.repository.js";
export * from "./repositories/platformImage.repository.js";
export * from "./validators/platform.validator.js";

/**
 * Named convenience exports — dipakai langsung oleh API routes.
 * Ini mem-bypass kebutuhan destructure dari wildcard export di atas.
 */
export const getPlatformBySlug        = platformService.getPlatformBySlug;
export const listPlatforms            = platformService.listPlatforms;
export const updatePlatformBySlug     = platformService.updatePlatformBySlug;
export const updatePlatformWithMainImage = platformService.updatePlatformWithMainImage;
export const getPlatformImages        = platformService.getPlatformImages;
export const getPlatformImage         = platformService.getPlatformImage;
export const updatePlatformImage      = platformService.updatePlatformImage;
export const updatePlatformImageWithFile = platformService.updatePlatformImageWithFile;

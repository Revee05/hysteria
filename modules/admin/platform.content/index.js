/**
 * platform.content module — entry point
 *
 * Mengelola konten item (episode, video, dsb.) yang terhubung ke Platform,
 * beserta gambar dan kategori per konten.
 *
 * Struktur folder:
 *   repository/  → akses DB via Prisma (PlatformContent + PlatformContentImage)
 *   servies/     → business logic + validasi
 *   validators/  → Zod schema
 */

export * from "./repository/platformContent.repository.js";
export * from "./validators/platformContent.validator.js";
export * from "./services/platformContent.service.js";

// Named convenience exports — dipakai langsung oleh API routes
import * as svc from "./services/platformContent.service.js";
export const listPlatformContents        = svc.listPlatformContents;
export const listPlatformContentsBySlug  = svc.listPlatformContentsBySlug;
export const getPlatformContent    = svc.getPlatformContent;
export const createPlatformContent = svc.createPlatformContent;
export const updatePlatformContent = svc.updatePlatformContent;
export const deletePlatformContent = svc.deletePlatformContent;
export const addContentImage       = svc.addContentImage;
export const updateContentImage    = svc.updateContentImage;
export const removeContentImage    = svc.removeContentImage;

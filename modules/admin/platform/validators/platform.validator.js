/**
 * platform.validator.js
 *
 * Skema validasi Zod untuk input platform.
 * Dipakai oleh platform.service.js sebelum menyentuh database.
 *
 * Pola umum:
 * - Field teks opsional memakai helper `optionalText` → string kosong/null di-treat sebagai "tidak diisi" (undefined).
 * - Field URL opsional memakai helper `optionalUrl`   → validasi format URL plus length limit.
 * - mainImageUrl punya logika khusus: null eksplisit diperbolehkan untuk menghapus gambar.
 */
import { z } from "zod";

// Slug harus lowercase alphanumeric dengan pemisah tanda hubung (contoh: "artlab", "laki-masak")
const slugSchema = z
  .string()
  .min(1, "Platform slug is required")
  .max(100, "Platform slug must not exceed 100 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Platform slug must be lowercase alphanumeric with hyphens only");

/**
 * Helper untuk field teks opsional yang datang dari FormData.
 * String kosong, null, atau string "null" (dari form serialization) dikonversi ke undefined
 * supaya Zod memperlakukannya sebagai "tidak dikirim" (bukan string kosong).
 */
const optionalText = (max, message) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === "null") return undefined;
    return val;
  }, z.string().max(max, message).optional().nullable());

/**
 * Helper untuk field URL opsional (instagram, youtube, dll).
 * Sama seperti optionalText tapi menambahkan validasi format URL.
 */
const optionalUrl = (max, message) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === "null") return undefined;
    return val;
  }, z.string().url(message).max(max, `${message} must not exceed ${max} characters`).optional().nullable());

/**
 * Schema khusus untuk mainImageUrl.
 * Berbeda dari optionalUrl karena null eksplisit diperbolehkan (untuk menghapus gambar).
 * Menerima:
 * - Path lokal awalan "/" dengan ekstensi gambar yang valid (jpg, png, webp, dll)
 * - URL HTTP/HTTPS penuh
 * - null / string kosong → dikonversi ke null (hapus gambar)
 */
const mainImageUrlSchema = z.preprocess(
  (val) => {
    // String kosong atau "null" dari FormData dianggap permintaan hapus gambar
    if (val === "" || val === null || val === "null") return null;
    return val;
  },
  z
    .string()
    .max(500, "Image URL must not exceed 500 characters")
    .refine(
      (url) => {
        if (!url || typeof url !== "string") return false;
        if (url.startsWith("/")) {
          return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
        }
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "Image URL must be a valid local path or HTTP(S) URL" },
    )
    .nullable(),
);

/** Dipakai untuk memvalidasi parameter slug saja (misalnya di GET endpoint). */
export const platformSlugSchema = z.object({
  slug: slugSchema,
});

/**
 * Dipakai untuk memvalidasi body PATCH platform.
 * Semua field (kecuali slug) bersifat opsional — hanya field yang dikirim yang akan diperbarui.
 * mainImageUrl.optional() agar key ini boleh tidak ada sama sekali di payload.
 */
export const updatePlatformSchema = z.object({
  slug: slugSchema,
  headline: optionalText(500, "Headline must not exceed 500 characters"),
  subHeadline: optionalText(5000, "Sub-headline must not exceed 5000 characters"),
  instagram: optionalUrl(500, "Instagram URL"),
  youtube: optionalUrl(500, "YouTube URL"),
  youtubeProfile: optionalUrl(500, "YouTube profile URL"),
  mainImageUrl: mainImageUrlSchema.optional(), // optional() = boleh tidak ada di payload
});

/**
 * Wrapper tipis di atas schema.parse() agar pemanggil tidak perlu import Zod secara langsung.
 * Melempar ZodError jika validasi gagal; caller di service yang menangani error-nya.
 */
export function validatePlatformData(data, schema) {
  return schema.parse(data);
}

/**
 * cover.validator.js
 *
 * Skema validasi Zod khusus untuk operasi cover image.
 * Hanya memvalidasi field teks (title, subtitle) — field imageUrl diisi oleh service
 * setelah proses upload berhasil, bukan dari input user langsung.
 */
import { z } from "zod";

/**
 * Helper untuk field teks opsional dari FormData.
 * String kosong / null / "null" dikonversi ke undefined agar Zod memperlakukannya
 * sebagai "tidak dikirim" (tidak mengubah nilai yang sudah ada di DB).
 */
const optionalText = (max, message) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === "null") return undefined;
    return val;
  }, z.string().max(max, message).optional().nullable());

/**
 * Schema untuk body PATCH cover image.
 * Semua field opsional — hanya field yang dikirim yang akan diperbarui.
 */
export const updateCoverSchema = z.object({
  title:    optionalText(500,  "Title must not exceed 500 characters"),
  subtitle: optionalText(2000, "Subtitle must not exceed 2000 characters"),
});

/**
 * Wrapper tipis agar caller tidak perlu import Zod langsung.
 * schema default ke updateCoverSchema jika tidak diberikan.
 */
export function validateCoverData(data, schema = updateCoverSchema) {
  return schema.parse(data);
}

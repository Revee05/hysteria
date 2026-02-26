/**
 * platformImage.repository.js
 *
 * Operasi database untuk tabel "PlatformImage".
 * Setiap platform memiliki beberapa slot gambar yang diidentifikasi dengan key unik
 * (contoh: "cover-1", "hero-podcast-artlab").
 * Tidak ada business logic di sini — hanya query dan return data mentah.
 */
import { prisma } from "../../../../lib/prisma.js";

/**
 * Mengambil satu PlatformImage berdasarkan platformId + key.
 * Mengembalikan null jika tidak ditemukan.
 */
export async function findImageByPlatformAndKey(platformId, key) {
  const rows = await prisma.$queryRaw`
    SELECT id, "platformId", key, type, label, title, subtitle,
           "imageUrl", "order", "createdAt", "updatedAt"
    FROM "PlatformImage"
    WHERE "platformId" = ${platformId} AND key = ${key}
    LIMIT 1
  `;
  return Array.isArray(rows) ? rows[0] || null : null;
}

/**
 * Mengambil semua PlatformImage milik sebuah platform.
 * @param {number} platformId - ID platform yang dicari gambarnya.
 * @param {string|null} type  - Filter opsional: "cover" atau "hero". null = semua.
 */
export async function listImagesByPlatformId(platformId, type = null) {
  if (type) {
    // Hanya ambil slot bertipe tertentu (cover atau hero)
    return prisma.$queryRaw`
      SELECT id, "platformId", key, type, label, title, subtitle,
             "imageUrl", "order", "createdAt", "updatedAt"
      FROM "PlatformImage"
      WHERE "platformId" = ${platformId} AND type = ${type}
      ORDER BY "order" ASC, id ASC
    `;
  }
  // Tanpa filter tipe — kembalikan semua slot gambar platform ini
  return prisma.$queryRaw`
    SELECT id, "platformId", key, type, label, title, subtitle,
           "imageUrl", "order", "createdAt", "updatedAt"
    FROM "PlatformImage"
    WHERE "platformId" = ${platformId}
    ORDER BY "order" ASC, id ASC
  `;
}

/**
 * Update (partial) data satu PlatformImage berdasarkan platformId + key.
 *
 * Pola update:
 * - title, subtitle  → COALESCE: tidak null berarti ganti, null berarti biarkan nilai lama.
 * - imageUrl         → CASE WHEN hasImageUrl:
 *     - Jika key "imageUrl" ada di objek `data` (meski nilainya null) → kolom diperbarui.
 *     - Jika key "imageUrl" tidak ada sama sekali → kolom TIDAK disentuh.
 *   Ini memungkinkan penghapusan gambar (imageUrl: null) tanpa menimpa gambar lama secara tidak sengaja.
 */
export async function upsertImageByKey(platformId, key, data) {
  // Cek apakah caller secara eksplisit mengirim field imageUrl (bisa null = hapus gambar)
  const hasImageUrl = Object.prototype.hasOwnProperty.call(data || {}, "imageUrl");
  const imageUrl = data?.imageUrl ?? null;
  const title = data?.title ?? null;
  const subtitle = data?.subtitle ?? null;

  const updated = await prisma.$queryRaw`
    UPDATE "PlatformImage"
    SET
      "title"     = COALESCE(${title}, "title"),
      "subtitle"  = COALESCE(${subtitle}, "subtitle"),
      "imageUrl"  = CASE WHEN ${hasImageUrl} THEN ${imageUrl} ELSE "imageUrl" END,
      "updatedAt" = NOW()
    WHERE "platformId" = ${platformId} AND key = ${key}
    RETURNING id, "platformId", key, type, label, title, subtitle,
              "imageUrl", "order", "createdAt", "updatedAt"
  `;

  return Array.isArray(updated) ? updated[0] || null : null;
}

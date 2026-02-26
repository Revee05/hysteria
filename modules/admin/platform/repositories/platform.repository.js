/**
 * platform.repository.js
 *
 * Layer paling bawah dari modul platform.
 * Berisi semua operasi database (raw SQL via Prisma.$queryRaw) untuk tabel "Platform".
 * Tidak ada business logic di sini — hanya query dan return data mentah.
 */
import { prisma } from "../../../../lib/prisma.js";

/**
 * Mengambil satu baris Platform berdasarkan slug.
 * Mengembalikan null jika tidak ditemukan.
 */
export async function findPlatformBySlug(slug) {
  const rows = await prisma.$queryRaw`
    SELECT id, slug, name, headline, "subHeadline",
           instagram, youtube, "youtubeProfile", "mainImageUrl", "isActive"
    FROM "Platform"
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return Array.isArray(rows) ? rows[0] || null : null;
}

/**
 * Mengambil satu Platform beserta semua PlatformImage-nya (eager-load).
 * Gambar diurutkan berdasarkan kolom `order` ASC, lalu id ASC sebagai tiebreaker.
 * Mengembalikan null jika platform tidak ditemukan.
 */
export async function findPlatformBySlugWithImages(slug) {
  const platform = await findPlatformBySlug(slug);
  if (!platform) return null;

  // Ambil semua slot gambar yang terhubung ke platform ini
  const images = await prisma.$queryRaw`
    SELECT id, "platformId", key, type, label, title, subtitle,
           "imageUrl"
    FROM "PlatformImage"
    WHERE "platformId" = ${platform.id}
    ORDER BY "order" ASC, id ASC
  `;

  // Ambil semua kategori platform, JOIN ke CategoryItem untuk title/slug/url
  const categories = await prisma.$queryRaw`
    SELECT pc.id, pc."platformId", pc."categoryItemId",
           ci.title, ci.slug, ci.url,
           pc.layout, pc.filters
    FROM "PlatformCategory" pc
    JOIN "CategoryItem" ci ON ci.id = pc."categoryItemId"
    WHERE pc."platformId" = ${platform.id}
    ORDER BY pc."order" ASC, pc.id ASC
  `;

  return {
    ...platform,
    images: Array.isArray(images) ? images : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

/**
 * Mengambil semua platform.
 * @param {boolean} onlyActive - Jika true (default), hanya mengembalikan platform yang aktif.
 */
export async function listAllPlatforms(onlyActive = true) {
  if (onlyActive) {
    return prisma.$queryRaw`
      SELECT id, slug, name, headline, "subHeadline",
             instagram, youtube, "youtubeProfile", "mainImageUrl"
      FROM "Platform"
      WHERE "isActive" = true
      ORDER BY id ASC
    `;
  }
  // Tanpa filter isActive — digunakan jika perlu menampilkan semua platform termasuk yang nonaktif
  return prisma.$queryRaw`
    SELECT id, slug, name, headline, "subHeadline",
           instagram, youtube, "youtubeProfile", "mainImageUrl"
    FROM "Platform"
    ORDER BY id ASC
  `;
}

/**
 * Update (partial) data Platform berdasarkan slug.
 * Hanya field yang dikirim yang akan diperbarui — field yang tidak ada di `data` dibiarkan.
 *
 * Pola yang digunakan:
 * - COALESCE(nilai_baru, nilai_lama)  → jika nilai_baru = null, kolom tidak berubah.
 * - CASE WHEN hasMainImageUrl THEN nilai ELSE nilai_lama END
 *   → memungkinkan pengiriman null secara eksplisit untuk menghapus gambar.
 *   → jika key `mainImageUrl` tidak ada di objek `data` sama sekali, kolom tidak disentuh.
 */
export async function upsertPlatformBySlug(slug, data) {
  const headline = data?.headline ?? null;
  const subHeadline = data?.subHeadline ?? null;
  const instagram = data?.instagram ?? null;
  const youtube = data?.youtube ?? null;
  const youtubeProfile = data?.youtubeProfile ?? null;

  // hasOwnProperty dipakai bukan hanya falsy check, supaya null yang dikirim eksplisit tetap diproses
  const hasMainImageUrl = Object.prototype.hasOwnProperty.call(data || {}, "mainImageUrl");
  const mainImageUrl = data?.mainImageUrl ?? null;

  const updated = await prisma.$queryRaw`
    UPDATE "Platform"
    SET
      "headline"       = COALESCE(${headline}, "headline"),
      "subHeadline"    = COALESCE(${subHeadline}, "subHeadline"),
      "instagram"      = COALESCE(${instagram}, "instagram"),
      "youtube"        = COALESCE(${youtube}, "youtube"),
      "youtubeProfile" = COALESCE(${youtubeProfile}, "youtubeProfile"),
      "mainImageUrl"   = CASE WHEN ${hasMainImageUrl} THEN ${mainImageUrl} ELSE "mainImageUrl" END,
      "updatedAt"      = NOW()
    WHERE slug = ${slug}
    RETURNING id, slug, name, headline, "subHeadline",
              instagram, youtube, "youtubeProfile", "mainImageUrl", "isActive",
              "createdAt", "updatedAt"
  `;

  return Array.isArray(updated) ? updated[0] || null : null;
}

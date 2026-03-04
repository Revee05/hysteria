/**
 * platform.service.js untuk service API pada pembuatan halaman slug page platform 
 *
 * Business logic utama untuk modul platform.
 * Layer ini duduk di antara API route (controller) dan repository (database).
 *
 * Tanggung jawab:
 * - Validasi input menggunakan Zod schema
 * - Mengakses data via platformRepository dan platformImageRepository
 * - Mengelola upload & penghapusan file gambar melalui Uploads helper
 * - Melempar AppError yang akan ditangkap oleh route handler
 */
import { AppError } from "../../../../lib/response.js";
import { logInfo, logWarning, logError } from "../../../../lib/api-logger.js";
import Uploads from "../../../../lib/upload/uploads.js";
import * as platformRepository from "../repositories/platform.repository.js";
import * as platformImageRepository from "../repositories/platformImage.repository.js";
import { platformSlugSchema, updatePlatformSchema, validatePlatformData } from "../validators/platform.validator.js";

/** Normalisasi slug: trim whitespace dan lowercase agar konsisten ke DB. */
const normalizeSlug = (slug) =>
  String(slug || "")
    .trim()
    .toLowerCase();

/**
 * Menentukan apakah sebuah URL/path merupakan file yang dikelola oleh sistem upload internal.
 * Hanya file yang dikelola (local /uploads/ atau S3 milik sendiri) yang boleh dihapus otomatis
 * saat gambar diganti — untuk menghindari penghapusan URL gambar eksternal yang tidak kita miliki.
 */
const isManagedUpload = (source) => {
  if (!source || typeof source !== "string") return false;
  const normalized = source.replace(/\\/g, "/");
  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/") || normalized.includes("/uploads/")) return true;
  if (process.env.S3_PUBLIC_URL) {
    const publicUrl = process.env.S3_PUBLIC_URL.replace(/\/$/, "");
    if (normalized.startsWith(publicUrl)) return true;
  }
  if (/s3\.amazonaws\.com/.test(normalized) || /s3[.-]/.test(normalized)) return true;
  return false;
};

/**
 * Mengambil data platform (beserta semua gambarnya) berdasarkan slug.
 * Mengembalikan null jika tidak ditemukan — caller yang memutuskan response 404-nya.
 */
export async function getPlatformBySlug(slug) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][GET] Start", { slug: normalizedSlug });

  let validated;
  try {
    validated = validatePlatformData({ slug: normalizedSlug }, platformSlugSchema);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || "Invalid platform slug", 400, "VALIDATION_ERROR");
  }

  // Eager-load gambar sekaligus supaya tidak perlu query kedua di caller
  const platform = await platformRepository.findPlatformBySlugWithImages(validated.slug);
  logInfo("[Platform][Service][GET] Success", { slug: validated.slug, found: !!platform });
  return platform;
}

/**
 * Mengambil daftar semua platform yang aktif (isActive = true).
 * Tidak meng-include daftar gambar — gunakan getPlatformBySlug untuk data lengkap.
 */
export async function listPlatforms() {
  logInfo("[Platform][Service][LIST] Start");
  const platforms = await platformRepository.listAllPlatforms(true);
  logInfo("[Platform][Service][LIST] Success", { count: Array.isArray(platforms) ? platforms.length : 0 });
  return Array.isArray(platforms) ? platforms : [];
}

/**
 * Update field teks platform (dan/atau menghapus mainImageUrl jika dikirim null eksplisit).
 * Dipakai untuk PATCH tanpa file — body berupa JSON.
 * Untuk update dengan file gambar baru, gunakan updatePlatformWithMainImage.
 */
export async function updatePlatformBySlug(slug, data = {}) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][UPDATE] Start", {
    slug: normalizedSlug,
    dataKeys: Object.keys(data || {}),
  });

  let validated;
  try {
    validated = validatePlatformData({ ...data, slug: normalizedSlug }, updatePlatformSchema);
  } catch (error) {
    logWarning("[Platform][Service][UPDATE] Validation failed", { slug: normalizedSlug, error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Invalid platform data", 400, "VALIDATION_ERROR");
  }

  // Pisahkan slug dari payload — slug hanya dipakai sebagai kunci WHERE, bukan kolom yang diupdate
  const { slug: validatedSlug, ...payload } = validated;
  const existing = await platformRepository.findPlatformBySlug(validatedSlug);

  if (!existing) {
    throw new AppError(`Platform '${validatedSlug}' not found`, 404, "NOT_FOUND");
  }

  const platform = await platformRepository.upsertPlatformBySlug(validatedSlug, payload);
  logInfo("[Platform][Service][UPDATE] Success", { slug: validatedSlug, id: platform?.id });
  return platform;
}

/**
 * Update platform beserta upload gambar utama baru (mainImageUrl).
 * Dipakai untuk PATCH dengan multipart/form-data.
 *
 * Alur:
 * 1. Validasi field teks (slug tidak boleh ada mainImageUrl di schema karena akan di-override file)
 * 2. Pastikan platform ada di DB
 * 3. Upload file baru
 * 4. Simpan URL baru ke DB
 * 5. Hapus file lama jika merupakan file milik sistem (isManagedUpload)
 * 6. Jika ada error setelah upload berhasil, rollback (hapus file yang baru di-upload)
 */
export async function updatePlatformWithMainImage(slug, data = {}, file) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][UPLOAD] Start", {
    slug: normalizedSlug,
    fileName: file?.originalname || file?.filename || null,
    fileType: file?.mimetype || null,
  });

  let validated;
  try {
    // omit mainImageUrl dari schema karena nilainya akan diganti URL hasil upload, bukan dari payload
    validated = validatePlatformData(
      { ...data, slug: normalizedSlug },
      updatePlatformSchema.omit({ mainImageUrl: true }),
    );
  } catch (error) {
    logWarning("[Platform][Service][UPLOAD] Validation failed", { slug: normalizedSlug, error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Invalid platform data", 400, "VALIDATION_ERROR");
  }

  const existing = await platformRepository.findPlatformBySlug(validated.slug);
  if (!existing) {
    throw new AppError(`Platform '${validated.slug}' not found`, 404, "NOT_FOUND");
  }

  const uploads = new Uploads();
  let uploadedUrl = null; // disimpan di luar try agar bisa di-cleanup jika error setelah upload

  try {
    logInfo("[Platform][Service][UPLOAD] Uploading main image", { slug: validated.slug });
    const uploadResult = await uploads.handleUpload(file);
    uploadedUrl = uploadResult?.url;

    if (!uploadedUrl) {
      throw new AppError("Failed to upload image", 500);
    }

    const { slug: validatedSlug, ...textFields } = validated;
    const payload = { ...textFields, mainImageUrl: uploadedUrl };
    const platform = await platformRepository.upsertPlatformBySlug(validatedSlug, payload);

    logInfo("[Platform][Service][UPLOAD] Persisted", { slug: validatedSlug, id: platform?.id });

    // Hapus file lama SETELAH berhasil disimpan ke DB — urutan penting untuk menghindari data orphan
    if (existing.mainImageUrl && existing.mainImageUrl !== uploadedUrl && isManagedUpload(existing.mainImageUrl)) {
      try {
        await uploads.deleteFile(existing.mainImageUrl);
      } catch (cleanupError) {
        // Gagal hapus file lama bukan error fatal — log saja, data DB sudah benar
        logWarning("[Platform][Service][UPLOAD] Failed to delete old main image", {
          slug: validatedSlug,
          oldImage: existing.mainImageUrl,
          error: cleanupError?.message,
        });
      }
    }

    return platform;
  } catch (error) {
    logError("[Platform][Service][UPLOAD] Failed", error, { slug: normalizedSlug });
    // Rollback: hapus file yang sudah ter-upload jika proses selanjutnya (DB save) gagal
    if (uploadedUrl) {
      try {
        await uploads.deleteFile(uploadedUrl);
      } catch (cleanupError) {
        logWarning("[Platform][Service][UPLOAD] Cleanup failed", { uploadedUrl, error: cleanupError?.message });
      }
    }
    if (error instanceof AppError) throw error;
    throw new AppError(error?.message || "Failed to save platform", 500);
  }
}

/**
 * Mengambil daftar slot gambar milik sebuah platform.
 * @param {string}      slug - Slug platform.
 * @param {string|null} type - Filter opsional: "cover" atau "hero". null = semua tipe.
 */
export async function getPlatformImages(slug, type = null) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][IMAGES] Start", { slug: normalizedSlug, type });

  const platform = await platformRepository.findPlatformBySlug(normalizedSlug);
  if (!platform) {
    throw new AppError(`Platform '${normalizedSlug}' not found`, 404, "NOT_FOUND");
  }

  const images = await platformImageRepository.listImagesByPlatformId(platform.id, type || null);
  return Array.isArray(images) ? images : [];
}

/** Mengambil satu slot gambar berdasarkan slug platform + key gambar. */
export async function getPlatformImage(slug, key) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][IMAGE-GET] Start", { slug: normalizedSlug, key });

  const platform = await platformRepository.findPlatformBySlug(normalizedSlug);
  if (!platform) {
    throw new AppError(`Platform '${normalizedSlug}' not found`, 404, "NOT_FOUND");
  }

  const image = await platformImageRepository.findImageByPlatformAndKey(platform.id, key);
  if (!image) {
    throw new AppError(`Image '${key}' not found for platform '${normalizedSlug}'`, 404, "NOT_FOUND");
  }

  logInfo("[Platform][Service][IMAGE-GET] Success", { slug: normalizedSlug, key, id: image.id });
  return image;
}

/**
 * Update field teks sebuah slot gambar (title, subtitle) tanpa mengubah file gambarnya.
 * Dipakai untuk PATCH dengan body JSON — tidak ada upload file.
 * Untuk update + upload file baru, gunakan updatePlatformImageWithFile.
 */
export async function updatePlatformImage(slug, key, data = {}) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][IMAGE-UPDATE] Start", { slug: normalizedSlug, key });

  const platform = await platformRepository.findPlatformBySlug(normalizedSlug);
  if (!platform) {
    throw new AppError(`Platform '${normalizedSlug}' not found`, 404, "NOT_FOUND");
  }

  const existing = await platformImageRepository.findImageByPlatformAndKey(platform.id, key);
  if (!existing) {
    throw new AppError(`Image '${key}' not found for platform '${normalizedSlug}'`, 404, "NOT_FOUND");
  }

  // Hanya masukkan field yang dikirim ke payload — undefined berarti tidak diubah
  const payload = {};
  if (data?.title !== undefined) payload.title = data.title;
  if (data?.subtitle !== undefined) payload.subtitle = data.subtitle;
  // imageUrl juga bisa dikirim null eksplisit untuk menghapus gambar (tanpa upload baru)
  if (Object.prototype.hasOwnProperty.call(data || {}, "imageUrl")) payload.imageUrl = data.imageUrl;

  const image = await platformImageRepository.upsertImageByKey(platform.id, key, payload);
  logInfo("[Platform][Service][IMAGE-UPDATE] Success", { slug: normalizedSlug, key, id: image?.id });
  return image;
}

/**
 * Update sebuah slot gambar beserta upload file baru.
 * Dipakai untuk PATCH dengan multipart/form-data pada endpoint /images/[key].
 *
 * Alur sama dengan updatePlatformWithMainImage:
 * 1. Upload file → dapat URL baru
 * 2. Simpan URL + field teks ke DB
 * 3. Hapus file lama (jika ada dan di-manage sistem)
 * 4. Rollback upload jika DB save gagal
 */
export async function updatePlatformImageWithFile(slug, key, data = {}, file) {
  const normalizedSlug = normalizeSlug(slug);
  logInfo("[Platform][Service][IMAGE-UPLOAD] Start", {
    slug: normalizedSlug,
    key,
    fileName: file?.originalname || file?.filename || null,
    fileType: file?.mimetype || null,
  });

  const platform = await platformRepository.findPlatformBySlug(normalizedSlug);
  if (!platform) {
    throw new AppError(`Platform '${normalizedSlug}' not found`, 404, "NOT_FOUND");
  }

  const existing = await platformImageRepository.findImageByPlatformAndKey(platform.id, key);
  if (!existing) {
    throw new AppError(`Image '${key}' not found for platform '${normalizedSlug}'`, 404, "NOT_FOUND");
  }

  const uploads = new Uploads();
  let uploadedUrl = null; // disimpan di luar try agar bisa di-cleanup jika error setelah upload

  try {
    const uploadResult = await uploads.handleUpload(file);
    uploadedUrl = uploadResult?.url;

    if (!uploadedUrl) {
      throw new AppError("Failed to upload image", 500);
    }

    // Bangun payload — title/subtitle opsional (hanya masuk jika dikirim)
    const payload = { imageUrl: uploadedUrl };
    if (data?.title !== undefined) payload.title = data.title;
    if (data?.subtitle !== undefined) payload.subtitle = data.subtitle;

    const image = await platformImageRepository.upsertImageByKey(platform.id, key, payload);
    logInfo("[Platform][Service][IMAGE-UPLOAD] Persisted", { slug: normalizedSlug, key, id: image?.id });

    // Hapus file lama SETELAH DB berhasil disimpan
    if (existing.imageUrl && existing.imageUrl !== uploadedUrl && isManagedUpload(existing.imageUrl)) {
      try {
        await uploads.deleteFile(existing.imageUrl);
      } catch (cleanupError) {
        // Log warning, tapi jangan throw — proses utama sudah sukses
        logWarning("[Platform][Service][IMAGE-UPLOAD] Failed to delete old image", {
          slug: normalizedSlug,
          key,
          oldImage: existing.imageUrl,
          error: cleanupError?.message,
        });
      }
    }

    return image;
  } catch (error) {
    logError("[Platform][Service][IMAGE-UPLOAD] Failed", error, { slug: normalizedSlug, key });
    // Rollback: hapus file yang sudah ter-upload jika proses DB gagal
    if (uploadedUrl) {
      try {
        await uploads.deleteFile(uploadedUrl);
      } catch (cleanupError) {
        logWarning("[Platform][Service][IMAGE-UPLOAD] Cleanup failed", { uploadedUrl, error: cleanupError?.message });
      }
    }
    if (error instanceof AppError) throw error;
    throw new AppError(error?.message || "Failed to save image", 500);
  }
}

/**
 * platformContent.validator.js
 *
 * Skema validasi Zod untuk PlatformContent dan PlatformContentImage.
 */
import { z } from "zod";

/** Helper: string opsional dengan batas panjang, kosong → undefined. */
const optionalText = (max, message) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === "null" ? undefined : val),
    z.string().max(max, message).optional(),
  );

/**
 * Helper untuk UPDATE: string nullable dengan batas panjang.
 * Kosong / null → null  (artinya "hapus nilai ini di DB").
 * undefined           → undefined (artinya "jangan ubah field ini").
 */
const clearableText = (max, message) =>
  z.preprocess(
    (val) => (val === "" || val === "null" ? null : val === undefined ? undefined : val),
    z.string().max(max, message).nullable().optional(),
  );

/** Pola domain yang diizinkan untuk field URL konten. */
const ALLOWED_URL_PATTERN =
  /^https?:\/\/(www\.)?(instagram\.com|instagr\.am|youtube\.com|youtu\.be|drive\.google\.com)/i;

const INSTAGRAM_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/i;
const YOUTUBE_URL_PATTERN   = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i;

/** Helper: URL opsional, hanya instagram / youtube / google drive. */
const optionalUrl = (max) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === "null" ? undefined : val),
    z
      .string()
      .url("URL tidak valid")
      .max(max, `URL tidak boleh lebih dari ${max} karakter`)
      .refine(
        (val) => ALLOWED_URL_PATTERN.test(val),
        "URL hanya boleh dari Instagram, YouTube, atau Google Drive",
      )
      .optional(),
  );

/** Helper: angka opsional, string numerik di-cast ke number. */
const optionalYear = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined || val === "null") return undefined;
    const n = Number(val);
    return isNaN(n) ? val : n;
  },
  z.number().int().min(1900).max(2100).optional(),
);

/** Helper: Int opsional (untuk order, categoryItemId dll.) */
const optionalInt = (min = 0) =>
  z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : undefined),
    z.number().int().min(min).optional(),
  );

/** Helper: Boolean opsional dari string/boolean. */
const optionalBool = z.preprocess(
  (val) =>
    val === "true" || val === true ? true : val === "false" || val === false ? false : undefined,
  z.boolean().optional(),
);

/** Helper: URL opsional, hanya instagram. */
const optionalInstagramUrl = (max) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === "null" ? undefined : val),
    z
      .string()
      .url("URL Instagram tidak valid")
      .max(max, `URL tidak boleh lebih dari ${max} karakter`)
      .refine(
        (val) => INSTAGRAM_URL_PATTERN.test(val),
        "URL hanya boleh dari Instagram (instagram.com)",
      )
      .optional(),
  );

/** Helper: URL opsional, hanya youtube. */
const optionalYoutubeUrl = (max) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === "null" ? undefined : val),
    z
      .string()
      .url("URL YouTube tidak valid")
      .max(max, `URL tidak boleh lebih dari ${max} karakter`)
      .refine(
        (val) => YOUTUBE_URL_PATTERN.test(val),
        "URL hanya boleh dari YouTube (youtube.com / youtu.be)",
      )
      .optional(),
  );

/** Helper: array of string (tags) — menerima JSON string atau array langsung. */
const optionalTagsArray = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return undefined; }
  },
  z.array(z.string().max(100)).max(50, "Maksimal 50 tag").optional(),
);

/** Helper: array of string for guests — menerima JSON string atau array langsung. */
const optionalGuestsArray = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return undefined; }
  },
  z.array(z.string().max(255)).max(50, "Maksimal 50 guests").optional(),
);

/** Helper: flexible meta field — menerima JSON string atau nilai bebas. */
const optionalMeta = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "" || val === "null") return undefined;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  },
  z.any().optional(),
);

// ─── CONTENT SCHEMAS ─────────────────────────────────────────────────────────

/** Schema validasi saat membuat konten baru (POST). */
export const createContentSchema = z.object({
  platformId: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z.number({ required_error: "platformId wajib diisi" }).int().positive(),
  ),
  categoryItemId: optionalInt(1),
  title: z.string().min(1, "Judul wajib diisi").max(500, "Judul terlalu panjang"),
  prevdescription: optionalText(140, "Prev description terlalu panjang"),
  description: optionalText(5000, "Deskripsi terlalu panjang"),
  url: optionalUrl(500),
  instagram: optionalInstagramUrl(500),
  youtube: optionalYoutubeUrl(500),
  meta: optionalMeta,
  host: optionalText(255, "Host terlalu panjang"),
  guests: optionalGuestsArray,
  year: optionalYear,
  tags: optionalTagsArray,
  order: optionalInt(0),
  views: optionalInt(0),
  isActive: optionalBool,
});

/** Schema validasi saat update sebagian (PATCH) — semua field opsional kecuali minimal 1. */
export const updateContentSchema = z
  .object({
    categoryItemId: z.preprocess(
      (val) => {
        if (val === null || val === "null" || val === "") return null; // allow explicit unset
        if (val !== undefined) return Number(val);
        return undefined;
      },
      z.number().int().positive().nullable().optional(),
    ),
    title: optionalText(500, "Judul terlalu panjang"),
    description: clearableText(5000, "Deskripsi terlalu panjang"),
    prevdescription: clearableText(140, "Prev description terlalu panjang"),
    url: optionalUrl(500),
    instagram: optionalInstagramUrl(500),
    youtube: optionalYoutubeUrl(500),
    meta: optionalMeta,
    year: optionalYear,
    tags: optionalTagsArray,
    order: optionalInt(0),
    views: optionalInt(0),
    isActive: optionalBool,
    host: clearableText(255, "Host terlalu panjang"),
    guests: optionalGuestsArray,
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Minimal satu field harus diisi untuk update",
  });

// ─── IMAGE SCHEMAS ────────────────────────────────────────────────────────────

/** Schema validasi saat menambah gambar ke konten (POST). */
export const createContentImageSchema = z.object({
  contentId: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z.number({ required_error: "contentId wajib diisi" }).int().positive(),
  ),
  imageUrl: optionalText(500, "imageUrl terlalu panjang"),
  alt: optionalText(255, "Alt terlalu panjang"),
  order: optionalInt(0),
});

/** Schema validasi saat update gambar (PATCH). */
export const updateContentImageSchema = z
  .object({
    imageUrl: optionalText(500, "imageUrl terlalu panjang"),
    alt: optionalText(255, "Alt terlalu panjang"),
    order: optionalInt(0),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Minimal satu field harus diisi untuk update",
  });

// ─── HELPER ───────────────────────────────────────────────────────────────────

/**
 * Memvalidasi data menggunakan schema Zod.
 * @param {object} data
 * @param {z.ZodSchema} schema
 * @returns {object} parsed data
 * @throws {z.ZodError}
 */
export function validateContentData(data, schema) {
  return schema.parse(data);
}

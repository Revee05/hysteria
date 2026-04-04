import { z } from 'zod';

// ── Google Drive folder URL ──────────────────────────────────────────────────
// Accepts: https://drive.google.com/drive/folders/<folderId>
const googleDriveUrlSchema = z.string().refine((val) => {
  try {
    const u = new URL(val);
    if (u.hostname !== 'drive.google.com') return false;
    return u.pathname.startsWith('/drive/folders/');
  } catch {
    return false;
  }
}, { message: 'Invalid Google Drive folder URL. Expected https://drive.google.com/drive/folders/<folderId>' });

// ── YouTube watch URL ────────────────────────────────────────────────────────
// Accepts: https://www.youtube.com/watch?v=...  OR  https://youtu.be/...
const youtubeUrlSchema = z.string().refine((val) => {
  try {
    const u = new URL(val);
    const isWatch =
      (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') &&
      u.pathname === '/watch' &&
      u.searchParams.has('v');
    const isShort = u.hostname === 'youtu.be' && u.pathname.length > 1;
    return isWatch || isShort;
  } catch {
    return false;
  }
}, { message: 'Invalid YouTube URL. Expected https://www.youtube.com/watch?v=<id> or https://youtu.be/<id>' });

// ── Shared optional fields ───────────────────────────────────────────────────
const commonFields = {
  parentId: z.number().int().nullable().optional(),
  order: z.number().int().optional(),
  meta: z.any().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().optional(),
};

// ── Per-item schemas ─────────────────────────────────────────────────────────
export const update3DSchema = z.object({
  url: googleDriveUrlSchema.optional(),
  ...commonFields,
});

export const updateFotoKegiatanSchema = z.object({
  url: googleDriveUrlSchema.optional(),
  ...commonFields,
});

export const updateShortFilmDokumenterSchema = z.object({
  url: youtubeUrlSchema.optional(),
  ...commonFields,
});

// ── Generic validate helper ──────────────────────────────────────────────────
export function validateDitampartData(data, schema) {
  return schema.parse(data);
}

/**
 * Frontend validator for SubForm.
 * Exports a simple function that returns an errors object.
 * Kept in sync with BE: modules/admin/platform.content/validators/platformContent.validator.js
 */

// Sync with BE ALLOWED_URL_PATTERN
const ALLOWED_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am|youtube\.com|youtu\.be|drive\.google\.com)/i;
const INSTAGRAM_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/i;
const YOUTUBE_URL_PATTERN   = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i;

/** Normalise input: empty string / null → undefined. */
function normalizeUrl(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
  const s = String(raw).trim();
  return s.match(/^https?:\/\//i) ? s : `https://${s}`;
}

export function validateSubForm(data) {
  const errors = { title: '', year: '', url: '', instagram: '', youtube: '', description: '' };

  // title — wajib diisi (sync: z.string().min(1).max(500))
  if (!data.title || String(data.title).trim() === '') {
    errors.title = 'Judul wajib diisi';
  } else if (String(data.title).length > 500) {
    errors.title = 'Judul terlalu panjang (maks 500 karakter)';
  }

  // year — opsional, integer 1900-2100 (sync: z.number().int().min(1900).max(2100))
  if (data.year !== undefined && data.year !== null && String(data.year).trim() !== '') {
    const n = Number(data.year);
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 1900 || n > 2100) {
      errors.year = 'Tahun tidak valid (1900-2100)';
    }
  }

  // url — opsional, hanya instagram / youtube / google drive (sync: optionalUrl)
  const urlVal = normalizeUrl(data.url);
  if (urlVal !== undefined) {
    try {
      new URL(urlVal);
      if (!ALLOWED_URL_PATTERN.test(urlVal)) {
        errors.url = 'URL hanya boleh dari Instagram, YouTube, atau Google Drive';
      } else if (urlVal.length > 500) {
        errors.url = 'URL tidak boleh lebih dari 500 karakter';
      }
    } catch {
      errors.url = 'URL tidak valid';
    }
  }

  // instagram — opsional, hanya instagram.com / instagr.am (sync: optionalInstagramUrl)
  const igVal = normalizeUrl(data.instagram);
  if (igVal !== undefined) {
    try {
      new URL(igVal);
      if (!INSTAGRAM_URL_PATTERN.test(igVal)) {
        errors.instagram = 'URL hanya boleh dari Instagram (instagram.com)';
      } else if (igVal.length > 500) {
        errors.instagram = 'URL tidak boleh lebih dari 500 karakter';
      }
    } catch {
      errors.instagram = 'URL Instagram tidak valid';
    }
  }

  // youtube — opsional, hanya youtube.com / youtu.be (sync: optionalYoutubeUrl)
  const ytVal = normalizeUrl(data.youtube);
  if (ytVal !== undefined) {
    try {
      new URL(ytVal);
      if (!YOUTUBE_URL_PATTERN.test(ytVal)) {
        errors.youtube = 'URL hanya boleh dari YouTube (youtube.com / youtu.be)';
      } else if (ytVal.length > 500) {
        errors.youtube = 'URL tidak boleh lebih dari 500 karakter';
      }
    } catch {
      errors.youtube = 'URL YouTube tidak valid';
    }
  }

  // description — opsional, maks 5000 karakter (sync: optionalText(5000))
  if (data.description !== undefined && data.description !== null && String(data.description).trim() !== '') {
    if (String(data.description).length > 5000) {
      errors.description = 'Deskripsi terlalu panjang (maks 5000 karakter)';
    }
  }

  return errors;
}

export default validateSubForm;

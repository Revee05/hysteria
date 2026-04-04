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
  const errors = {
    title: '',
    year: '',
    url: '',
    instagram: '',
    youtube: '',
    prevdescription: '',
    description: '',
    tags: '',
    meta: '',
    host: '',
    guests: '',
    views: '',
    image: '',
  };

  // title — wajib diisi (sync: z.string().min(1).max(500))
  if (!data.title || String(data.title).trim() === '') {
    errors.title = 'Judul wajib diisi';
  } else if (String(data.title).length > 500) {
    errors.title = 'Judul terlalu panjang (maks 500 karakter)';
  }

  // year — opsional, integer 1900-2100 (sync: z.number().int().min(1900).max(2100))
  if (data.year !== undefined && data.year !== null && String(data.year).trim() !== '') {
    const n = Number(data.year);
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      errors.year = 'Tahun harus berupa angka bulat (contoh: 2024)';
    } else if (n < 1900 || n > 2100) {
      errors.year = 'Tahun tidak valid — harus antara 1900 dan 2100';
    }
  }

  // url — opsional, hanya instagram / youtube / google drive (sync: optionalUrl)
  const urlVal = normalizeUrl(data.url);
  if (urlVal !== undefined) {
    try {
      new URL(urlVal);
      if (urlVal.length > 500) {
        errors.url = 'URL tidak boleh lebih dari 500 karakter';
      } else if (!ALLOWED_URL_PATTERN.test(urlVal)) {
        errors.url = 'URL hanya boleh dari Instagram, YouTube, atau Google Drive';
      }
    } catch {
      errors.url = 'URL tidak valid — pastikan formatnya benar (contoh: https://youtube.com/...)';
    }
  }

  // instagram — opsional, hanya instagram.com / instagr.am (sync: optionalInstagramUrl)
  const igVal = normalizeUrl(data.instagram);
  if (igVal !== undefined) {
    try {
      new URL(igVal);
      if (igVal.length > 500) {
        errors.instagram = 'URL tidak boleh lebih dari 500 karakter';
      } else if (!INSTAGRAM_URL_PATTERN.test(igVal)) {
        errors.instagram = 'URL hanya boleh dari Instagram (instagram.com atau instagr.am)';
      }
    } catch {
      errors.instagram = 'URL Instagram tidak valid — gunakan format https://instagram.com/...';
    }
  }

  // youtube — opsional, hanya youtube.com / youtu.be (sync: optionalYoutubeUrl)
  const ytVal = normalizeUrl(data.youtube);
  if (ytVal !== undefined) {
    try {
      new URL(ytVal);
      if (ytVal.length > 500) {
        errors.youtube = 'URL tidak boleh lebih dari 500 karakter';
      } else if (!YOUTUBE_URL_PATTERN.test(ytVal)) {
        errors.youtube = 'URL hanya boleh dari YouTube (youtube.com atau youtu.be)';
      }
    } catch {
      errors.youtube = 'URL YouTube tidak valid — gunakan format https://youtube.com/...';
    }
  }

  // prevdescription — opsional, maks 140 karakter (sync: optionalText(140))
  if (data.prevdescription !== undefined && data.prevdescription !== null && String(data.prevdescription).trim() !== '') {
    if (String(data.prevdescription).length > 140) {
      errors.prevdescription = `Preview deskripsi terlalu panjang — ${String(data.prevdescription).length}/140 karakter`;
    }
  }

  // description — opsional, maks 5000 karakter (sync: optionalText(5000))
  if (data.description !== undefined && data.description !== null && String(data.description).trim() !== '') {
    if (String(data.description).length > 5000) {
      errors.description = `Deskripsi terlalu panjang — ${String(data.description).length}/5000 karakter`;
    }
  }

  // host — opsional, maks 255 karakter (sync: optionalText(255))
  if (data.host !== undefined && data.host !== null && String(data.host).trim() !== '') {
    if (String(data.host).length > 255) {
      errors.host = 'Nama host terlalu panjang (maks 255 karakter)';
    }
  }

  // guests — opsional, array maks 50 item, tiap item maks 255 karakter (sync: optionalGuestsArray)
  if (Array.isArray(data.guests) && data.guests.length > 0) {
    if (data.guests.length > 50) {
      errors.guests = 'Maksimal 50 guests';
    } else {
      const longGuest = data.guests.find((g) => String(g).length > 255);
      if (longGuest) {
        errors.guests = 'Nama guest terlalu panjang (maks 255 karakter per guest)';
      }
    }
  }

  // tags — opsional, array maks 50 item, tiap item maks 100 karakter (sync: optionalTagsArray)
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    if (data.tags.length > 50) {
      errors.tags = 'Maksimal 50 tag';
    } else {
      const longTag = data.tags.find((t) => String(t).length > 100);
      if (longTag) {
        errors.tags = 'Tag terlalu panjang (maks 100 karakter per tag)';
      }
    }
  }

  // views — opsional, non-negative integer
  if (data.views !== undefined && data.views !== null && String(data.views).trim() !== '') {
    const v = Number(data.views);
    if (Number.isNaN(v) || !Number.isInteger(v)) {
      errors.views = 'Views harus berupa angka bulat';
    } else if (v < 0) {
      errors.views = 'Views tidak boleh kurang dari 0';
    }
  }

  // meta — tidak ada validasi khusus di frontend (diterima string / JSON / apapun)

  return errors;
}

export default validateSubForm;

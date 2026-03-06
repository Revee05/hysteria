/**
 * Frontend validator for SubForm.
 * Exports a simple function that returns an errors object { title, year, url }.
 */

// Allowed URL pattern: instagram, youtube, drive
const ALLOWED_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am|youtube\.com|youtu\.be|drive\.google\.com)/i;

export function validateSubForm(data) {
  const errors = { title: '', year: '', url: '' };

  if (!data.title || String(data.title).trim() === '') {
    errors.title = 'Judul wajib diisi';
  }

  if (data.year !== undefined && data.year !== null && String(data.year).trim() !== '') {
    const n = Number(data.year);
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 1900 || n > 2100) {
      errors.year = 'Tahun tidak valid (1900-2100)';
    }
  }

  if (data.url !== undefined && data.url !== null && String(data.url).trim() !== '') {
    const raw = String(data.url).trim();
    try {
      // Allow URLs without protocol by prepending https:// for validation
      const candidate = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
      new URL(candidate);
      if (!ALLOWED_URL_PATTERN.test(candidate)) {
        errors.url = 'URL hanya boleh dari Instagram, YouTube, atau Google Drive';
      }
    } catch (err) {
      errors.url = 'URL tidak valid';
    }
  }

  return errors;
}

export default validateSubForm;

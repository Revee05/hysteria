export function validateCreateEvent(body) {
  const errors = {};

  if (!body.title) errors.title = "Judul event wajib diisi";
  if (!body.startAt) errors.startAt = "Tanggal mulai wajib diisi";
  if (!body.location) errors.location = "Lokasi wajib diisi";
  if (!body.poster) errors.poster = "Poster wajib diupload";
  if (!body.description) errors.description = "Deskripsi wajib diisi";

  if (!Array.isArray(body.categoryItemIds) || body.categoryItemIds.length === 0) {
    errors.categoryItemIds = "Minimal pilih 1 kategori";
  }

  if (!Array.isArray(body.organizerItemIds) || body.organizerItemIds.length === 0) {
    errors.organizerItemIds = "Minimal pilih 1 penyelenggara";
  }

  return errors;
}
/**
 * platform.event.content.service.js
 *
 * Service layer untuk query event per platform:
 *  - Ditampart  : events berdasarkan organizer slug "ditampart"
 *  - Artlab     : events per kategori — workshop, screening-film, untuk-perhatian, stonen-29-radio-show
 *  - Laki Masak : events kategori meramu
 *
 * Slug CategoryItem di bawah diasumsikan sesuai data seed.
 * Jika slug berbeda di database, sesuaikan konstanta SLUG_* di bawah.
 */
import * as repo from "../repository/platform.event.content.repository.js";

// ─── Slug CategoryItem (sesuaikan dengan data di database) ───────────────────
const SLUG_ORG_DITAMPART = "ditampart";

const SLUG_CAT_WORKSHOP = "workshop-artlab";
const SLUG_CAT_SCREENING = "screening-film";
const SLUG_CAT_UNTUK_PERHATIAN = "untuk-perhatian";
const SLUG_CAT_STONEN = "stonen-29-radio-show";

const SLUG_CAT_MERAMU = "meramu";

// ═══════════════════════════════════════════════════════════════
// DITAMPART
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil semua event Ditampart.
 * @param {{ q?: string, status?: string, categorySlug?: string }} [filters]
 */
export function getDitampartEvents(filters = {}) {
  return repo.findEventsByOrganizer(SLUG_ORG_DITAMPART, filters);
}

// ═══════════════════════════════════════════════════════════════
// HYSTERIA ARTLAB
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil semua event Artlab: Workshop, Screening Film, dan Untuk Perhatian.
 * Jika filters.categorySlug diisi, akan filter ke satu kategori saja.
 * @param {{ q?: string, status?: string, categorySlug?: string }} [filters]
 */
export function getArtlabEvents(filters = {}) {
  const { categorySlug, ...rest } = filters;
  const slugs = categorySlug
    ? [categorySlug]
    : [SLUG_CAT_WORKSHOP, SLUG_CAT_SCREENING, SLUG_CAT_UNTUK_PERHATIAN, SLUG_CAT_STONEN];
  return repo.findEventsByCategory(slugs, rest);
}

// ═══════════════════════════════════════════════════════════════
// LAKI MASAK
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil event Laki Masak — kategori Meramu.
 * @param {{ q?: string, status?: string }} [filters]
 */
export function getLakiMasakMeramuEvents(filters = {}) {
  return repo.findEventsByCategory(SLUG_CAT_MERAMU, filters);
}

import { PLATFORM_DATA } from './data'

const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export function listPlatforms() {
  return Object.entries(PLATFORM_DATA).map(([slug, data]) => ({ slug, head: data.head }))
}

export function getPlatform(slug) {
  if (!slug) return null
  return PLATFORM_DATA[slug] || null
}

export function listCategories(slug) {
  const p = getPlatform(slug)
  if (!p) return null
  return p.categories || []
}

export function getCategory(slug, categorySlug) {
  if (!slug) return null
  const categories = listCategories(slug)
  if (!categories) return null

  if (!categorySlug) return categories[0] || null

  let found = categories.find((c) => c.slug === categorySlug)
  if (found) return found

  found = categories.find((c) => normalize(c.title) === normalize(categorySlug))
  if (found) return found

  return null
}

const apiData = {
  listPlatforms,
  getPlatform,
  listCategories,
  getCategory,
}

export default apiData

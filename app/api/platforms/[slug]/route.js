import { NextResponse } from 'next/server'
import { getPlatformBySlug } from '../../../../modules/admin/platform/services/platform.service'

/**
 * GET /api/platforms/[slug]
 *
 * Returns platform data sourced entirely from DB.
 * Field names match exact DB column names so frontend components use them directly.
 *
 *   Platform        → headline, subHeadline, instagram, youtube, youtubeProfile
 *   PlatformImage   → images[]  (type=main  → { src, alt })
 *                     categories[].imageUrl (type=cover, overlaid by index)
 *   PlatformCategory→ categories[]  (title, slug, url via JOIN CategoryItem; layout, description, filters)
 */
function buildResponse(slug, db) {

  // ── images: PlatformImage type=main ──────────────────────────────────────
  const mainImages = (db.images || [])
    .filter((img) => img.type === 'main' && img.imageUrl)
    .sort((a, b) => a.order - b.order)
    .map((img) => ({ src: img.imageUrl, alt: img.label || slug }))

  // Fallback: jika tidak ada PlatformImage bertipe 'main', gunakan Platform.mainImageUrl
  const images =
    mainImages.length > 0
      ? mainImages
      : db.mainImageUrl
      ? [{ src: db.mainImageUrl, alt: db.name || slug }]
      : []

  // ── cover images: PlatformImage type=cover, matched by index ─────────────
  const coverImages = (db.images || [])
    .filter((img) => img.type === 'cover' && img.imageUrl)
    .sort((a, b) => a.order - b.order)

  // ── categories: PlatformCategory rows ────────────────────────────────────
  const categories = (db.categories || [])
    .sort((a, b) => a.order - b.order)
    .map((cat, idx) => ({
      title:       cat.title,
      slug:        cat.slug,
      url:         cat.url,
      layout:      cat.layout || 'grid',
      description: cat.description || '',
      filters:     Array.isArray(cat.filters) ? cat.filters : [],
      imageUrl:    coverImages[idx]?.imageUrl || '',
    }))

  return {
    headline:       db.headline       || '',
    subHeadline:    db.subHeadline    || '',
    instagram:      db.instagram      || '',
    youtube:        db.youtube        || '',
    youtubeProfile: db.youtubeProfile || '',
    multyImages:    images.length > 1,
    images,
    categories,
  }
}

export async function GET(req, { params }) {
  try {
    const { slug } = (await params) || {}

    const db = await getPlatformBySlug(slug)
    if (!db) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const data = buildResponse(slug, db)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getPublicCategory } from '../../../../../../modules/public/platform/services/platform.public.service.js'

export async function GET(req, { params }) {
  try {
    const { slug, category } = (await params) || {}
    const data = await getPublicCategory(slug, category)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

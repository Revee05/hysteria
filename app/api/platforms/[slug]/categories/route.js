import { NextResponse } from 'next/server'
import { listPublicCategories } from '../../../../../modules/public/platform/services/platform.public.service.js'

export async function GET(req, { params }) {
  try {
    const { slug } = (await params) || {}
    const data = await listPublicCategories(slug)
    if (data === null) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

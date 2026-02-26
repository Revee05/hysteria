import { NextResponse } from 'next/server'
import { getCategory } from '../../../../../platform/apiData'

export async function GET(req, { params }) {
  try {
    const { slug, category } = params || {}
    const data = getCategory(slug, category)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

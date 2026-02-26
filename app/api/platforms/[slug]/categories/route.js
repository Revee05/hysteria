import { NextResponse } from 'next/server'
import { listCategories } from '../../../../platform/apiData'

export async function GET(req, { params }) {
  try {
    const { slug } = params || {}
    const data = listCategories(slug)
    if (data === null) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getPlatform } from '../../../platform/apiData'

export async function GET(req, { params }) {
  try {
    const { slug } = params || {}
    const data = getPlatform(slug)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

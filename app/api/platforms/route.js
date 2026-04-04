import { NextResponse } from 'next/server'
import { listPublicPlatforms } from '../../../modules/public/platform/services/platform.public.service.js'

export async function GET() {
  try {
    const data = await listPublicPlatforms()
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

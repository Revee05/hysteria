import { NextResponse } from 'next/server'
import { listPlatforms } from '../../platform/apiData'

export async function GET() {
  try {
    const data = listPlatforms()
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

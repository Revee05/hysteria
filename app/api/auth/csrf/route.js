import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { setCsrfCookie } from '../../../../lib/cookies.js'

export async function GET() {
  const token = crypto.randomBytes(32).toString('hex')
  const response = NextResponse.json({ success: true, data: { csrfToken: token } })
  setCsrfCookie(response, token)
  return response
}

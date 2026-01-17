import { NextResponse } from 'next/server'
import { COOKIE_NAMES } from '../config/cookie.config.js'

export function middleware(request) {
  const token = request.cookies.get(COOKIE_NAMES.access)?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

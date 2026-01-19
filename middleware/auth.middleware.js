import { NextResponse } from 'next/server'
import { COOKIE_NAMES } from '../config/cookie.config.js'
import { verifyAccessToken } from '../lib/jwt.js'

/**
 * Middleware untuk autentikasi
 * 
 * CATATAN: Middleware berjalan di Edge Runtime yang tidak support:
 * - Node.js modules (crypto, fs, dll)
 * - Prisma (database operations)
 * 
 * Karena itu, middleware ini HANYA:
 * 1. Cek access token valid -> lanjut
 * 2. Jika expired/missing -> redirect ke login
 * 
 * Auto-refresh token dilakukan di:
 * - Client-side: auth-context.jsx (auto refresh sebelum expired)
 * - Server-side: layout.jsx bisa panggil /api/auth/refresh jika perlu
 */

// Matcher pattern untuk middleware ini
export const matcher = ['/admin/:path*']

// Handler function yang akan dipanggil oleh delegator
export async function handle(request) {
  const accessToken = request.cookies.get(COOKIE_NAMES.access)?.value

  // Jika tidak ada access token, redirect ke login
  if (!accessToken) {
    return redirectToLogin(request)
  }

  // Verifikasi access token
  try {
    verifyAccessToken(accessToken)
    return NextResponse.next()
  } catch (err) {
    // Access token expired/invalid -> redirect ke login
    // Client akan attempt auto-refresh saat di halaman login
    return redirectToLogin(request)
  }
}

/**
 * Redirect ke halaman login
 */
function redirectToLogin(request) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  return NextResponse.redirect(url)
}

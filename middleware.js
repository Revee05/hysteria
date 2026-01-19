import { NextResponse } from 'next/server'
import * as authMiddleware from './middleware/auth.middleware.js'
// import * as uploadMiddleware from './middleware/upload.middleware.js'

/**
 * Middleware Delegator - Entry point untuk semua middleware
 * 
 * Setiap middleware handler di folder ./middleware/ harus export:
 * - matcher: array of path patterns
 * - handle(request): async function yang return NextResponse
 * 
 * Untuk menambah middleware baru:
 * 1. Buat file di ./middleware/ (contoh: upload.middleware.js)
 * 2. Export matcher dan handle
 * 3. Import di sini dan tambahkan ke array handlers
 */

// Daftar semua middleware handlers
const handlers = [
  authMiddleware,
  // uploadMiddleware, // uncomment saat sudah dibuat
]

// Static matcher config - harus hardcoded, tidak bisa dynamic
// Saat menambah middleware baru, update matcher ini secara manual
export const config = {
  matcher: [
    '/admin/:path*',
    // '/api/upload/:path*',  // uncomment saat upload middleware aktif
    // '/api/files/:path*',   // uncomment saat upload middleware aktif
  ],
}

/**
 * Main middleware function - mendelegate ke handler yang sesuai
 */
export async function middleware(request) {
  const path = request.nextUrl.pathname

  // Cek setiap handler apakah cocok dengan path
  for (const handler of handlers) {
    if (!handler.matcher) continue

    // Simple pattern matching
    const isMatch = handler.matcher.some(pattern => {
      // Convert pattern seperti '/admin/:path*' jadi regex
      const regexPattern = pattern
        .replace(/:[^/]+/g, '[^/]+')  // :param jadi [^/]+
        .replace(/\*/g, '.*')           // * jadi .*
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(path)
    })

    if (isMatch && handler.handle) {
      return await handler.handle(request)
    }
  }

  // Tidak ada handler yang cocok, lanjutkan request
  return NextResponse.next()
}

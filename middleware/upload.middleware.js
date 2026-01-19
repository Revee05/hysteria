import { NextResponse } from 'next/server'

/**
 * Upload Middleware
 * 
 * Middleware untuk handle upload-related requests
 * Contoh: validasi file size, check quota, rate limiting, dll
 * 
 * NOTE: Next.js Edge Runtime punya limitasi:
 * - No access to Node.js APIs (fs, crypto, dll)
 * - Request body terbatas (4MB by default)
 * - Sebaiknya hanya untuk validation ringan
 */

// Matcher pattern untuk middleware ini
export const matcher = [
  '/api/upload/:path*',
  '/api/files/:path*',
]

// Handler function yang akan dipanggil oleh delegator
export async function handle(request) {
  const path = request.nextUrl.pathname

  // Contoh: Check file size dari header (jika client mengirim)
  const contentLength = request.headers.get('content-length')
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'File too large',
        message: `Maximum file size is ${maxSize / 1024 / 1024}MB` 
      },
      { status: 413 }
    )
  }

  // Contoh: Check authentication untuk upload
  // const accessToken = request.cookies.get('accessToken')?.value
  // if (!accessToken) {
  //   return NextResponse.json(
  //     { success: false, error: 'Unauthorized' },
  //     { status: 401 }
  //   )
  // }

  // Contoh: Add custom headers
  const response = NextResponse.next()
  response.headers.set('x-upload-middleware', 'processed')
  
  return response
}

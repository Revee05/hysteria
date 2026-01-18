import { NextResponse } from 'next/server'
import { COOKIE_NAMES, COOKIE_OPTIONS } from '../config/cookie.config.js'
import { verifyAccessToken, signAccessToken } from '../lib/jwt.js'
import { hashToken } from '../lib/hash.js'
import { prisma } from '../lib/prisma.js'
import { AUTH_CONFIG } from '../config/auth.config.js'
import crypto from 'crypto'

/**
 * Middleware untuk autentikasi dengan auto-refresh token
 * 
 * Flow:
 * 1. Cek access token - jika valid, lanjutkan
 * 2. Jika access token expired/invalid, coba refresh otomatis
 * 3. Jika refresh berhasil, set cookie baru dan lanjutkan
 * 4. Jika refresh gagal, redirect ke login
 */
export async function middleware(request) {
  const accessToken = request.cookies.get(COOKIE_NAMES.access)?.value
  const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

  // Jika tidak ada access token sama sekali
  if (!accessToken) {
    // Coba refresh jika ada refresh token
    if (refreshToken) {
      const refreshResult = await attemptTokenRefresh(refreshToken)
      if (refreshResult.success) {
        return createResponseWithNewTokens(request, refreshResult.tokens)
      }
    }
    
    // Tidak ada token atau refresh gagal -> redirect ke login
    return redirectToLogin(request)
  }

  // Verifikasi access token
  try {
    verifyAccessToken(accessToken)
    return NextResponse.next()
  } catch (err) {
    // Access token expired/invalid, coba refresh
    if (refreshToken) {
      const refreshResult = await attemptTokenRefresh(refreshToken)
      if (refreshResult.success) {
        return createResponseWithNewTokens(request, refreshResult.tokens)
      }
    }
    
    // Refresh gagal -> redirect ke login
    return redirectToLogin(request)
  }
}

/**
 * Mencoba refresh token dengan rotation
 */
async function attemptTokenRefresh(currentRefreshToken) {
  try {
    const tokenHash = hashToken(currentRefreshToken)
    
    // Find refresh token di database
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: {
        user: {
          include: {
            status: true,
            roles: { include: { role: true } },
          },
        },
      },
    })

    // Validasi refresh token
    if (!tokenRecord) {
      return { success: false, error: 'Token not found' }
    }
    if (tokenRecord.revokedAt) {
      return { success: false, error: 'Token revoked' }
    }
    if (tokenRecord.expiresAt < new Date()) {
      return { success: false, error: 'Token expired' }
    }
    if (tokenRecord.user?.status?.key !== 'ACTIVE') {
      return { success: false, error: 'User inactive' }
    }

    // Generate tokens baru
    const roles = tokenRecord.user.roles?.map((r) => r.role.key) || []
    const newAccessToken = signAccessToken({
      sub: String(tokenRecord.user.id),
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
      roles,
      status: tokenRecord.user.status?.key,
    })

    // Generate refresh token baru (rotation)
    const newRefreshToken = crypto.randomBytes(48).toString('hex')
    const newTokenHash = hashToken(newRefreshToken)
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshToken.seconds * 1000)

    // Simpan refresh token baru dan revoke yang lama
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { 
          revokedAt: new Date(), 
          replacedByTokenHash: newTokenHash 
        },
      }),
      prisma.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      }),
    ])

    return {
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    }
  } catch (error) {
    console.error('Token refresh error in middleware:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Buat response dengan tokens baru di cookies
 */
function createResponseWithNewTokens(request, tokens) {
  const response = NextResponse.next()
  
  response.cookies.set(COOKIE_NAMES.access, tokens.accessToken, COOKIE_OPTIONS.access)
  response.cookies.set(COOKIE_NAMES.refresh, tokens.refreshToken, COOKIE_OPTIONS.refresh)
  
  return response
}

/**
 * Redirect ke halaman login
 */
function redirectToLogin(request) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*'],
}

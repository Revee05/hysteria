import { NextResponse } from 'next/server'
import { respondError } from '../../../../lib/response.js'
import { clearAuthCookies, getCookie } from '../../../../lib/cookies.js'
import { COOKIE_NAMES } from '../../../../config/cookie.config.js'
import { requireCsrf } from '../../../../middleware/auth.middleware.js'
import { hashToken } from '../../../../lib/hash.js'
import { revokeRefreshToken } from '../../../../modules/auth/repositories/refresh-token.repository.js'
import logger from '../../../../lib/logger.js'

export async function POST(request) {
  try {
    requireCsrf(request)

    const refreshToken = getCookie(request, COOKIE_NAMES.refresh)
    if (refreshToken) {
      await revokeRefreshToken(hashToken(refreshToken))
    }

    const response = NextResponse.json({ success: true, data: null })
    clearAuthCookies(response)
    logger.info('User logged out successfully')
    return response
  } catch (error) {
    logger.error('Logout failed', { error: error.message })
    return respondError(error)
  }
}

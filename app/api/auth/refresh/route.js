import { NextResponse } from 'next/server'
import { respondError } from '../../../../lib/response.js'
import { createAccessToken } from '../../../../modules/auth/services/token.service.js'
import { rotateRefreshToken } from '../../../../modules/auth/services/refresh-token.service.js'
import { setAuthCookies, getCookie } from '../../../../lib/cookies.js'
import { COOKIE_NAMES } from '../../../../config/cookie.config.js'
import { requireCsrf } from '../../../../lib/helper/auth.helper.js'
import { STATUS_KEYS } from '../../../../modules/auth/domain/status.constants.js'
import logger from '../../../../lib/logger.js'
import { parseAccessToken } from '../../../../modules/auth/services/token.service.js'

export async function POST(request) {
  try {
    requireCsrf(request)

    const refreshToken = getCookie(request, COOKIE_NAMES.refresh)
    if (!refreshToken) {
      return respondError({ status: 401, code: 'NO_REFRESH_TOKEN', message: 'Refresh token missing' })
    }

    const rotated = await rotateRefreshToken(refreshToken)
    if (rotated.user?.status?.key !== STATUS_KEYS.ACTIVE) {
      return respondError({ status: 403, code: 'USER_INACTIVE', message: 'User is not active' })
    }

    const roles = rotated.user.roles?.map((r) => r.role.key) || []
    const accessToken = createAccessToken({
      sub: String(rotated.user.id),
      email: rotated.user.email,
      name: rotated.user.name,
      roles,
      status: rotated.user.status?.key,
    })

    // include access token expiry (exp) in response so client can schedule refresh
    let accessTokenPayload = null
    try {
      accessTokenPayload = parseAccessToken(accessToken)
    } catch (e) {
      // parsing shouldn't fail for a freshly created token, but ignore if it does
      accessTokenPayload = null
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: rotated.user.id,
          email: rotated.user.email,
          name: rotated.user.name,
          roles,
          status: rotated.user.status?.key,
        },
        accessTokenExpiry: accessTokenPayload?.exp || null, // unix seconds
      },
    })

    setAuthCookies(response, {
      accessToken,
      refreshToken: rotated.refresh.token,
    })

    logger.info('Token refreshed successfully', { userId: rotated.user.id })
    return response
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message })
    return respondError(error)
  }
}

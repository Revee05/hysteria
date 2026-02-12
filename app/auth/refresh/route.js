import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '../../../config/cookie.config.js'
import { rotateRefreshToken } from '../../../modules/auth/services/refresh-token.service.js'
import { createAccessToken } from '../../../modules/auth/services/token.service.js'
import { setAuthCookies } from '../../../lib/cookies.js'
import logger from '../../../lib/logger.js'
import { STATUS_KEYS } from '../../../modules/auth/domain/status.constants.js'

export async function GET(request) {
  // Read cookies from the incoming Request (route handlers expose cookies on the Request)
  const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

  const nextParam = new URL(request.url).searchParams.get('next') || '/admin'

  if (!refreshToken) {
    logger.warn('ServerRefresh: no refresh token, redirecting to login')
    return NextResponse.redirect('/auth/login')
  }

  try {
    const rotated = await rotateRefreshToken(refreshToken)

    if (rotated.user?.status?.key !== STATUS_KEYS.ACTIVE) {
      logger.warn('ServerRefresh: user not active', { userId: rotated.user?.id })
      return NextResponse.redirect('/auth/login')
    }

    const roles = rotated.user.roles?.map((r) => r.role.key) || []
    const accessToken = createAccessToken({
      sub: String(rotated.user.id),
      email: rotated.user.email,
      name: rotated.user.name,
      roles,
      status: rotated.user.status?.key,
    })

    const redirectUrl = nextParam && (nextParam.startsWith('http://') || nextParam.startsWith('https://'))
      ? nextParam
      : new URL(nextParam, request.url).toString()

    const response = NextResponse.redirect(redirectUrl)
    setAuthCookies(response, {
      accessToken,
      refreshToken: rotated.refresh.token,
    })

    logger.info('ServerRefresh: token rotated successfully', { userId: rotated.user.id })
    return response
  } catch (err) {
    logger.error('ServerRefresh: refresh failed', { error: err.message })
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

import { NextResponse } from 'next/server'
import { loginSchema } from '../../../../modules/auth/validators/login.validator.js'
import { loginWithEmailPassword } from '../../../../modules/auth/services/auth.service.js'
import { respondError } from '../../../../lib/response.js'
import { setAuthCookies } from '../../../../lib/cookies.js'
import { requireCsrf } from '../../../../middleware/auth.middleware.js'
import logger from '../../../../lib/logger.js'

export async function POST(request) {
  try {
    requireCsrf(request)

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return respondError({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message || 'Invalid input',
      })
    }

    const result = await loginWithEmailPassword(parsed.data.email, parsed.data.password)
    const response = NextResponse.json({ success: true, data: { user: result.user } })
    setAuthCookies(response, {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    })

    logger.info('User logged in successfully', { email: parsed.data.email, userId: result.user.id })
    return response
  } catch (error) {
    logger.error('Login failed', { error: error.message, email: parsed?.data?.email })
    return respondError(error)
  }
}

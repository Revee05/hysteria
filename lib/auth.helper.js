import { AppError } from './response.js'
import { parseAccessToken } from '../modules/auth/services/token.service.js'
import { COOKIE_NAMES } from '../config/cookie.config.js'
import { getCsrfFromRequest } from './cookies.js'

export function getAuthPayload(request) {
	const token = request.cookies.get(COOKIE_NAMES.access)?.value
	if (!token) {
		throw new AppError('Access token missing', 401, 'UNAUTHORIZED')
	}

	return parseAccessToken(token)
}

export function requireCsrf(request) {
	const { csrfCookie, csrfHeader } = getCsrfFromRequest(request)
	if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
		throw new AppError('Invalid CSRF token', 403, 'CSRF_INVALID')
	}
}

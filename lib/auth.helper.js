import { AppError } from './response.js'
import { parseAccessToken } from '../modules/auth/services/token.service.js'
import { COOKIE_NAMES } from '../config/cookie.config.js'
import { getCsrfFromRequest } from './cookies.js'
import { ROLE_KEYS } from '../modules/auth/domain/role.constants.js'
import { STATUS_KEYS } from '../modules/auth/domain/status.constants.js'

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

/**
 * Require authentication and optional role check.
 * Returns the parsed access token payload if valid.
 * @param {Request} request
 * @param {Array<string>} allowedRoles
 */
export async function requireAuth(request, allowedRoles = []) {
 	// getAuthPayload-like behavior but throw AppError with proper codes
 	const token = request.cookies.get(COOKIE_NAMES.access)?.value
 	if (!token) {
 		throw new AppError('Access token missing', 401, 'UNAUTHORIZED')
 	}

 	let payload
 	try {
 		payload = parseAccessToken(token)
 	} catch (err) {
 		throw new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED')
 	}

 	// Check status
 	if (payload.status && payload.status !== STATUS_KEYS.ACTIVE) {
 		throw new AppError('Account is not active', 403, 'FORBIDDEN')
 	}

 	// Check roles if provided
 	if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
 		const roles = payload.roles || []
 		const hasAllowed = roles.some(r => allowedRoles.includes(r))
 		if (!hasAllowed) {
 			throw new AppError('Insufficient role', 403, 'FORBIDDEN')
 		}
 	}

 	return payload
}

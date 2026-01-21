import { AppError } from '../response.js'
import { parseAccessToken } from '../../modules/auth/services/token.service.js'
import { COOKIE_NAMES } from '../../config/cookie.config.js'
import { getCsrfFromRequest } from '../cookies.js'
import { ROLE_KEYS } from '../../modules/auth/domain/role.constants.js'
import { STATUS_KEYS } from '../../modules/auth/domain/status.constants.js'
import { prisma } from '../prisma.js'

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

	// Check tokenVersion to support immediate invalidation when permissions/roles change.
	// Token includes `tokenVersion` when issued. If DB tokenVersion !== token's tokenVersion
	// then token is considered revoked and client must re-authenticate (refresh/login).
	try {
		const userId = payload.sub ? parseInt(payload.sub) : null
		if (userId) {
			const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true, statusId: true } })
			if (dbUser) {
				const tokenVersionInToken = payload.tokenVersion || 0
				const dbTokenVersion = dbUser.tokenVersion || 0
				console.log(`🔍 TokenVersion check: token=${tokenVersionInToken}, db=${dbTokenVersion}, userId=${userId}`)
				if (dbTokenVersion !== tokenVersionInToken) {
					console.log(`❌ TokenVersion mismatch! Rejecting token.`)
					throw new AppError('Access token invalidated', 401, 'INVALID_TOKEN_VERSION')
				}
			}
		}
	} catch (err) {
		// If it's an AppError about token version, rethrow; otherwise ignore DB errors and proceed (fail-open vs fail-closed tradeoff)
		if (err instanceof AppError) throw err
		// Log and continue without additional enforcement if DB is unreachable
		console.warn('Warning: failed to validate tokenVersion against DB', err && err.message)
	}

 	// Check status
 	if (payload.status && payload.status !== STATUS_KEYS.ACTIVE) {
 		throw new AppError('Account is not active', 403, 'FORBIDDEN')
 	}

 	// Check roles if provided
 	if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
 		const roles = payload.roles || []
 		
 		// Bypass permission check for SUPERADMIN
 		if (roles.includes(ROLE_KEYS.SUPERADMIN)) {
 			return payload
 		}
 		
 		const hasAllowed = roles.some(r => allowedRoles.includes(r))
 		if (!hasAllowed) {
 			throw new AppError('Insufficient role', 403, 'FORBIDDEN')
 		}
 	}

 	return payload
}

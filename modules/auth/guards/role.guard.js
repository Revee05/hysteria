import { AppError } from '../../../lib/response.js'

export function requireRole(user, allowedRoles = []) {
	const userRoles = user?.roles || []
	const hasRole = allowedRoles.some((role) => userRoles.includes(role))

	if (!hasRole) {
		throw new AppError('Insufficient role', 403, 'FORBIDDEN_ROLE')
	}
}

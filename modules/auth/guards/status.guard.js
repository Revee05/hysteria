import { AppError } from '../../../lib/response.js'

export function requireStatus(user, allowedStatuses = []) {
	if (!allowedStatuses.includes(user?.status)) {
		throw new AppError('User status not allowed', 403, 'FORBIDDEN_STATUS')
	}
}

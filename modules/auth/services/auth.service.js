import { AppError } from '../../../lib/response.js'
import { findUserByEmail, updateLastLogin } from '../repositories/user.repository.js'
import { verifyUserPassword } from './password.service.js'
import { createAccessToken } from './token.service.js'
import { createRefreshToken } from './refresh-token.service.js'
import { STATUS_KEYS } from '../domain/status.constants.js'
import logger from '../../../lib/logger.js'

function mapUserAuth(user) {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		status: user.status?.key,
		roles: user.roles?.map((r) => r.role.key) || [],
	}
}

export async function loginWithEmailPassword(email, password) {
	const user = await findUserByEmail(email)
	if (!user) {
		logger.warn('Login attempt with non-existent email', { email })
		throw new AppError('Email or password is invalid', 401, 'INVALID_CREDENTIALS')
	}

	if (user.status?.key !== STATUS_KEYS.ACTIVE) {
		logger.warn('Login attempt for inactive user', { email, status: user.status?.key })
		throw new AppError('User is not active', 403, 'USER_INACTIVE')
	}

	const passwordValid = await verifyUserPassword(password, user.password)
	if (!passwordValid) {
		logger.warn('Login attempt with invalid password', { email })
		throw new AppError('Email or password is invalid', 401, 'INVALID_CREDENTIALS')
	}

	const authUser = mapUserAuth(user)
	const accessToken = createAccessToken({
		sub: String(user.id),
		email: user.email,
		name: user.name,
		roles: authUser.roles,
		status: authUser.status,
	})

	const refresh = await createRefreshToken(user.id)
	await updateLastLogin(user.id)

	return {
		user: authUser,
		tokens: {
			accessToken,
			refreshToken: refresh.token,
			refreshExpiresAt: refresh.expiresAt,
		},
	}
}

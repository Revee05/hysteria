import crypto from 'crypto'
import { AUTH_CONFIG } from '../../../config/auth.config.js'
import { hashToken } from '../../../lib/hash.js'
import {
	createRefreshToken as createRefreshTokenRecord,
	findRefreshTokenByHash,
	revokeRefreshToken,
	revokeAllRefreshTokens,
} from '../repositories/refresh-token.repository.js'
import { AppError } from '../../../lib/response.js'
import logger from '../../../lib/logger.js'

export function generateRefreshToken() {
	return crypto.randomBytes(48).toString('hex')
}

export async function createRefreshToken(userId) {
	const token = generateRefreshToken()
	const tokenHash = hashToken(token)
	const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshToken.seconds * 1000)

	await createRefreshTokenRecord({
		userId,
		tokenHash,
		expiresAt,
	})

	return { token, expiresAt, tokenHash }
}

export async function rotateRefreshToken(currentToken) {
	const tokenHash = hashToken(currentToken)
	const tokenRecord = await findRefreshTokenByHash(tokenHash)

	if (!tokenRecord) {
		logger.warn('Refresh token rotation failed: token not found')
		throw new AppError('Refresh token not found', 401, 'INVALID_REFRESH_TOKEN')
	}
	if (tokenRecord.revokedAt) {
		logger.warn('Refresh token rotation failed: token revoked', { userId: tokenRecord.userId })
		throw new AppError('Refresh token revoked', 401, 'REVOKED_REFRESH_TOKEN')
	}
	if (tokenRecord.expiresAt < new Date()) {
		logger.warn('Refresh token rotation failed: token expired', { userId: tokenRecord.userId })
		throw new AppError('Refresh token expired', 401, 'EXPIRED_REFRESH_TOKEN')
	}

	const next = await createRefreshToken(tokenRecord.userId)
	await revokeRefreshToken(tokenHash, next.tokenHash)

	return { user: tokenRecord.user, refresh: next }
}

export async function revokeUserRefreshTokens(userId) {
	return revokeAllRefreshTokens(userId)
}

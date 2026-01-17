import jwt from 'jsonwebtoken'
import { AUTH_CONFIG, AUTH_ENV } from '../config/auth.config.js'

export function signAccessToken(payload) {
	if (!AUTH_ENV.accessTokenSecret) {
		throw new Error('JWT_SECRET is not set')
	}

	return jwt.sign(payload, AUTH_ENV.accessTokenSecret, {
		issuer: AUTH_CONFIG.issuer,
		audience: AUTH_CONFIG.audience,
		expiresIn: AUTH_CONFIG.accessToken.expiresIn,
	})
}

export function verifyAccessToken(token) {
	if (!AUTH_ENV.accessTokenSecret) {
		throw new Error('JWT_SECRET is not set')
	}

	return jwt.verify(token, AUTH_ENV.accessTokenSecret, {
		issuer: AUTH_CONFIG.issuer,
		audience: AUTH_CONFIG.audience,
	})
}

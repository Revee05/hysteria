import { signAccessToken, verifyAccessToken } from '../../../lib/jwt.js'

export function createAccessToken(payload) {
	return signAccessToken(payload)
}

export function parseAccessToken(token) {
	return verifyAccessToken(token)
}

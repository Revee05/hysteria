import bcrypt from 'bcrypt'
import crypto from 'crypto'

export async function hashPassword(password) {
	return bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
	return bcrypt.compare(password, hash)
}

export function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex')
}

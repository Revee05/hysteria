import { comparePassword, hashPassword } from '../../../lib/hash.js'

export async function hashUserPassword(password) {
	return hashPassword(password)
}

export async function verifyUserPassword(password, hash) {
	return comparePassword(password, hash)
}

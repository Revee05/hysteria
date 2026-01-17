import { prisma } from '../../../lib/prisma.js'

export async function createRefreshToken(data) {
	return prisma.refreshToken.create({ data })
}

export async function findRefreshTokenByHash(tokenHash) {
	return prisma.refreshToken.findFirst({
		where: { tokenHash },
		include: {
			user: {
				include: {
					status: true,
					roles: { include: { role: true } },
				},
			},
		},
	})
}

export async function revokeRefreshToken(tokenHash, replacedByTokenHash = null) {
	return prisma.refreshToken.updateMany({
		where: { tokenHash, revokedAt: null },
		data: { revokedAt: new Date(), replacedByTokenHash },
	})
}

export async function revokeAllRefreshTokens(userId) {
	return prisma.refreshToken.updateMany({
		where: { userId, revokedAt: null },
		data: { revokedAt: new Date() },
	})
}

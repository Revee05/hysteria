import { prisma } from '../../../lib/prisma.js'

export async function findUserByEmail(email) {
	return prisma.user.findUnique({
		where: { email },
		include: {
			status: true,
			roles: { include: { role: true } },
		},
	})
}

export async function findUserById(id) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			status: true,
			roles: { include: { role: true } },
		},
	})
}

export async function updateLastLogin(id) {
	return prisma.user.update({
		where: { id },
		data: { lastLoginAt: new Date() },
	})
}

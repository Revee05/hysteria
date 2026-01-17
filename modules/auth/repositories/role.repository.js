import { prisma } from '../../../lib/prisma.js'

export async function findRoleByKey(key) {
	return prisma.role.findUnique({ where: { key } })
}

export async function getUserRoles(userId) {
	const roles = await prisma.userRole.findMany({
		where: { userId },
		include: { role: true },
	})
	return roles.map((r) => r.role)
}

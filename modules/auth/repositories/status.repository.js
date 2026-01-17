import { prisma } from '../../../lib/prisma.js'

export async function findStatusByKey(key) {
	return prisma.userStatus.findUnique({ where: { key } })
}

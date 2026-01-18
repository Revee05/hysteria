import { prisma } from '../../../../lib/prisma.js'

/**
 * Find all users with cursor-based pagination and search
 * @param {Object} options
 * @param {number} options.perPage - Number of items per page (default: 10)
 * @param {number|null} options.cursor - Cursor ID for pagination
 * @param {string} options.search - Search term for email/name
 * @returns {Promise<{users: Array, nextCursor: number|null, hasMore: boolean}>}
 */
export async function findAllUsers({ perPage = 10, cursor = null, search = '' }) {
	const where = search
		? {
				OR: [
					{ email: { contains: search, mode: 'insensitive' } },
					{ name: { contains: search, mode: 'insensitive' } },
				],
		  }
		: {}

	const users = await prisma.user.findMany({
		where,
		take: perPage + 1, // Fetch one extra to check if there's more
		...(cursor && { cursor: { id: cursor }, skip: 1 }), // Skip the cursor itself
		orderBy: { id: 'asc' },
		include: {
			status: true,
			roles: {
				include: {
					role: true,
				},
			},
		},
	})

	const hasMore = users.length > perPage
	const returnedUsers = hasMore ? users.slice(0, perPage) : users
	const nextCursor = hasMore ? returnedUsers[returnedUsers.length - 1].id : null

	return {
		users: returnedUsers,
		nextCursor,
		hasMore,
	}
}

/**
 * Count total users (for pagination info)
 * @param {string} search - Search term
 * @returns {Promise<number>}
 */
export async function countUsers(search = '') {
	const where = search
		? {
				OR: [
					{ email: { contains: search, mode: 'insensitive' } },
					{ name: { contains: search, mode: 'insensitive' } },
				],
		  }
		: {}

	return prisma.user.count({ where })
}

/**
 * Find user by ID
 * @param {number} id
 * @returns {Promise<User|null>}
 */
export async function findUserById(id) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			status: true,
			roles: {
				include: {
					role: true,
				},
			},
		},
	})
}

/**
 * Delete user by ID
 * @param {number} id
 * @returns {Promise<User>}
 */
export async function deleteUserById(id) {
	return prisma.user.delete({
		where: { id },
	})
}

/**
 * Update user by ID
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<User>}
 */
export async function updateUserById(id, data) {
	return prisma.user.update({
		where: { id },
		data,
	})
}

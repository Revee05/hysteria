import { NextResponse } from 'next/server'
import { findAllUsers, countUsers, deleteUserById } from '../../../../modules/admin/users/repositories/user.repository.js'
import { respondError } from '../../../../lib/response.js'
import { requireAuth } from '../../../../lib/auth.helper.js'
import logger from '../../../../lib/logger.js'

/**
 * GET /api/admin/users
 * Get paginated list of users with search
 * Query params:
 * - perPage: number of items per page (default: 10)
 * - cursor: cursor ID for pagination
 * - search: search term for email/name
 */
export async function GET(request) {
	try {
		// Require authentication and admin or superadmin role
		const user = await requireAuth(request, ['ADMIN', 'SUPERADMIN'])
		
		const { searchParams } = new URL(request.url)
		const perPage = parseInt(searchParams.get('perPage') || '10')
		const cursor = searchParams.get('cursor') ? parseInt(searchParams.get('cursor')) : null
		const search = searchParams.get('search') || ''

		// Validate perPage
		if (perPage < 1 || perPage > 100) {
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'perPage must be between 1 and 100',
			})
		}

		const { users, nextCursor, hasMore } = await findAllUsers({ perPage, cursor, search })
		const total = await countUsers(search)

		// Remove sensitive data
		const sanitizedUsers = users.map(user => {
			const { password, ...userWithoutPassword } = user
			return userWithoutPassword
		})

		logger.info('Users fetched successfully', { 
			adminId: user.id, 
			count: sanitizedUsers.length,
			search,
			cursor
		})

		return NextResponse.json({
			success: true,
			data: {
				users: sanitizedUsers,
				pagination: {
					nextCursor,
					hasMore,
					total,
					perPage,
				},
			},
		})
	} catch (error) {
		logger.error('Failed to fetch users', { error: error.message })
		return respondError(error)
	}
}

/**
 * DELETE /api/admin/users?id=123
 * Delete a user by ID
 */
export async function DELETE(request) {
	try {
		// Require authentication and admin or superadmin role
		const user = await requireAuth(request, ['ADMIN', 'SUPERADMIN'])
		
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('id')

		if (!userId) {
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'User ID is required',
			})
		}

		const deletedUser = await deleteUserById(parseInt(userId))

		logger.info('User deleted successfully', { 
			adminId: user.id, 
			deletedUserId: deletedUser.id,
			deletedUserEmail: deletedUser.email
		})

		return NextResponse.json({
			success: true,
			data: { message: 'User deleted successfully' },
		})
	} catch (error) {
		logger.error('Failed to delete user', { error: error.message })
		return respondError(error)
	}
}

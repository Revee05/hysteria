import { NextResponse } from 'next/server'
import {
	findAllUsers,
	countUsers,
	createUser,
	updateUserById,
	deleteUserById,
} from '../../../../modules/admin/users/repositories/user.repository.js'
import { respondError } from '../../../../lib/response.js'
import { requireAuthWithPermission } from '../../../../lib/helper/permission.helper.js'
import { hashUserPassword } from '../../../../modules/auth/services/password.service.js'
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
		// Require authentication and 'users.read' permission
		// SUPERADMIN automatically bypasses this permission check
		const user = await requireAuthWithPermission(request, 'users.read')
		
		const { searchParams } = new URL(request.url)
		const perPage = parseInt(searchParams.get('perPage') || '10')
		const cursor = searchParams.get('cursor') ? parseInt(searchParams.get('cursor')) : null
		const search = searchParams.get('search') || ''

		logger.info('Users list request', { adminId: user.id, perPage, cursor, search })

		// Validate perPage
		if (perPage < 1 || perPage > 100) {
			logger.error('Invalid perPage value', { adminId: user.id, perPage })
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
			cursor,
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
		logger.error('Failed to fetch users', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

/**
 * POST /api/admin/users
 * Create a new user
 * Body: { email, password, name, statusId }
 */
export async function POST(request) {
	try {
		// Require authentication and 'users.create' permission
		// SUPERADMIN automatically bypasses this permission check
		const user = await requireAuthWithPermission(request, 'users.create')

		const body = await request.json()

		logger.info('Create user request', { adminId: user.id, email: body?.email, name: body?.name })

		// Validate required fields
		if (!body.email || !body.password || !body.name) {
			logger.error('Create user failed - missing required fields', { adminId: user.id, body: { email: body?.email, name: body?.name } })
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Email, password, and name are required',
			})
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(body.email)) {
			logger.error('Create user failed - invalid email format', { adminId: user.id, email: body.email })
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Invalid email format',
			})
		}

		// Hash password
		const hashedPassword = await hashUserPassword(body.password)

		// Get ACTIVE status ID if not provided
		let statusId = body.statusId
		if (!statusId) {
			// Default to ACTIVE status
			const { prisma } = await import('../../../../lib/prisma.js')
			// model is `UserStatus` in Prisma schema -> client uses `prisma.userStatus`
			const activeStatus = await prisma.userStatus.findUnique({
				where: { key: 'ACTIVE' },
			})
			if (!activeStatus) {
				logger.error('Create user failed - ACTIVE status missing', { adminId: user.id })
				return respondError({
					status: 500,
					code: 'INTERNAL_ERROR',
					message: 'ACTIVE status not found in database',
				})
			}
			statusId = activeStatus.id
		}

		// Create user
		const newUser = await createUser({
			email: body.email,
			password: hashedPassword,
			name: body.name,
			statusId: parseInt(statusId),
		})

		// Remove password from response
		const { password, ...userWithoutPassword } = newUser

		logger.info('User created successfully', {
			adminId: user.id,
			newUserId: newUser.id,
			newUserEmail: newUser.email,
		})

		return NextResponse.json({
			success: true,
			data: userWithoutPassword,
		})
	} catch (error) {
		logger.error('Failed to create user', { error: error.message, stack: error.stack })
		
		// Handle unique constraint violation (duplicate email)
		if (error.code === 'P2002') {
			logger.error('Create user failed - duplicate email', { error: error.message, stack: error.stack })
			return respondError({
				status: 409,
				code: 'DUPLICATE_EMAIL',
				message: 'Email already exists',
			})
		}
		
		return respondError(error)
	}
}

/**
 * PUT /api/admin/users
 * Update an existing user
 * Body: { id, email?, name?, password?, statusId? }
 */
export async function PUT(request) {
	try {
		// Require authentication and 'users.update' permission
		// SUPERADMIN automatically bypasses this permission check
		const user = await requireAuthWithPermission(request, 'users.update')

		const body = await request.json()

		logger.info('Update user request', { adminId: user.id, userId: body?.id })

		// Validate user ID
		if (!body.id) {
			logger.error('Update user failed - missing id', { adminId: user.id, body: { email: body?.email, name: body?.name } })
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'User ID is required',
			})
		}

		const userId = parseInt(body.id)

		// Build update data
		const updateData = {}

		if (body.email !== undefined) {
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(body.email)) {
				logger.error('Update user failed - invalid email format', { adminId: user.id, email: body.email })
				return respondError({
					status: 400,
					code: 'VALIDATION_ERROR',
					message: 'Invalid email format',
				})
			}
			updateData.email = body.email
		}

		if (body.name !== undefined) {
			updateData.name = body.name
		}

		if (body.password !== undefined && body.password !== '') {
			// Hash new password
			updateData.password = await hashUserPassword(body.password)
		}

		if (body.statusId !== undefined) {
			updateData.statusId = parseInt(body.statusId)
		}

		// Update user
		const updatedUser = await updateUserById(userId, updateData)

		// Remove password from response
		const { password, ...userWithoutPassword } = updatedUser

		logger.info('User updated successfully', {
			adminId: user.id,
			updatedUserId: updatedUser.id,
			updatedUserEmail: updatedUser.email,
		})

		return NextResponse.json({
			success: true,
			data: userWithoutPassword,
		})
	} catch (error) {
		logger.error('Failed to update user', { error: error.message, stack: error.stack })

		// Handle unique constraint violation (duplicate email)
		if (error.code === 'P2002') {
			logger.error('Update user failed - duplicate email', { error: error.message, stack: error.stack })
			return respondError({
				status: 409,
				code: 'DUPLICATE_EMAIL',
				message: 'Email already exists',
			})
		}

		// Handle user not found
		if (error.code === 'P2025') {
			logger.error('Update user failed - user not found', { error: error.message, stack: error.stack })
			return respondError({
				status: 404,
				code: 'USER_NOT_FOUND',
				message: 'User not found',
			})
		}

		return respondError(error)
	}
}

/**
 * DELETE /api/admin/users?id=123
 * Delete a user by ID
 */
export async function DELETE(request) {
	try {
		// Require authentication and 'users.delete' permission
		// SUPERADMIN automatically bypasses this permission check
		const user = await requireAuthWithPermission(request, 'users.delete')
		
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('id')

		if (!userId) {
			logger.error('Delete user failed - missing id', { adminId: user?.id })
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
			deletedUserEmail: deletedUser.email,
		})

		return NextResponse.json({
			success: true,
			data: { message: 'User deleted successfully' },
		})
	} catch (error) {
		logger.error('Failed to delete user', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

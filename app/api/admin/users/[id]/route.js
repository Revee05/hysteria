import { NextResponse } from 'next/server'
import { findUserById } from '../../../../../../modules/admin/users/repositories/user.repository.js'
import { respondError } from '../../../../../../lib/response.js'
import { requireAuthWithPermission } from '../../../../../../lib/helper/permission.helper.js'
import logger from '../../../../../../lib/logger.js'

/**
 * GET /api/admin/users/[id]
 * Get user details by ID
 */
export async function GET(request, { params }) {
	try {
		const user = await requireAuthWithPermission(request, 'users.read')

		const resolvedParams = await params
		const userId = parseInt(resolvedParams.id)

		logger.info('Get user details request', { adminId: user.id, userId })
		
		if (!userId || isNaN(userId)) {
			logger.error('Get user details failed - invalid userId', { adminId: user.id, userId: resolvedParams.id })
			return respondError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Invalid user ID',
			})
		}

		const targetUser = await findUserById(userId)

		if (!targetUser) {
			return respondError({
				status: 404,
				code: 'USER_NOT_FOUND',
				message: 'User not found',
			})
		}

		// Remove password from response
		const { password, ...userWithoutPassword } = targetUser

		logger.info('User details fetched', {
			adminId: user.id,
			targetUserId: targetUser.id,
		})

		return NextResponse.json({
			success: true,
			data: userWithoutPassword,
		})
	} catch (error) {
		logger.error('Failed to fetch user details', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

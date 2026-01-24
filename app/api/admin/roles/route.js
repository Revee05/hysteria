import { NextResponse } from 'next/server'
import { findAllRoles } from '../../../../modules/admin/users/repositories/userRole.repository.js'
import {
	createRole,
	updateRoleById,
	deleteRoleById,
	findRoleById,
} from '../../../../modules/admin/users/repositories/role.repository.js'
import { respondError } from '../../../../lib/response.js'
import { requireAuthWithPermission } from '../../../../lib/helper/permission.helper.js'
import logger from '../../../../lib/logger.js'

/**
 * GET /api/admin/roles
 * Get all available roles
 */
export async function GET(request) {
	try {
		const user = await requireAuthWithPermission(request, 'roles.read')

		logger.info('Roles list request', { adminId: user.id })

		const roles = await findAllRoles()

		logger.info('Roles fetched', {
			adminId: user.id,
			count: roles.length,
		})

		return NextResponse.json({
			success: true,
			data: { roles },
		})
	} catch (error) {
		logger.error('Failed to fetch roles', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

/**
 * POST /api/admin/roles
 * Body: { key, name?, description? }
 */
export async function POST(request) {
	try {
		const user = await requireAuthWithPermission(request, 'roles.create')
		const body = await request.json()

		logger.info('Create role request', { adminId: user.id, body })

		if (!body || !body.key) {
			logger.error('Create role failed - missing key', { adminId: user.id, body })
			return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Role key is required' })
		}

		const created = await createRole({ key: body.key, name: body.name || null, description: body.description || null })

		logger.info('Role created', { adminId: user.id, roleId: created.id })

		return NextResponse.json({ success: true, data: created })
	} catch (error) {
		logger.error('Failed to create role', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

/**
 * PUT /api/admin/roles
 * Body: { id, key?, name?, description? }
 */
export async function PUT(request) {
	try {
		const user = await requireAuthWithPermission(request, 'roles.update')
		const body = await request.json()

		logger.info('Update role request', { adminId: user.id, body })

		if (!body || !body.id) {
			logger.error('Update role failed - missing id', { adminId: user.id, body })
			return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Role id is required' })
		}

		const updated = await updateRoleById(parseInt(body.id), {
			key: body.key ?? undefined,
			name: body.name ?? undefined,
			description: body.description ?? undefined,
		})

		logger.info('Role updated', { adminId: user.id, roleId: updated.id })

		return NextResponse.json({ success: true, data: updated })
	} catch (error) {
		logger.error('Failed to update role', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

/**
 * DELETE /api/admin/roles?id=123
 */
export async function DELETE(request) {
	try {
		const user = await requireAuthWithPermission(request, 'roles.delete')

		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			logger.error('Delete role failed - missing id', { adminId: user.id })
			return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Role id is required' })
		}

		logger.info('Delete role request', { adminId: user.id, id })

		const deleted = await deleteRoleById(parseInt(id))

		logger.info('Role deleted', { adminId: user.id, roleId: deleted.id })

		return NextResponse.json({ success: true, data: { message: 'Role deleted' } })
	} catch (error) {
		logger.error('Failed to delete role', { error: error.message, stack: error.stack })
		return respondError(error)
	}
}

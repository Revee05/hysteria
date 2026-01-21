import { NextResponse } from 'next/server'
import { respondError } from '../../../../lib/response.js'
import { requireAuth } from '../../../../lib/helper/auth.helper.js'
import { findUserById } from '../../../../modules/auth/repositories/user.repository.js'
import logger from '../../../../lib/logger.js'

export async function GET(request) {
  try {
    // Use requireAuth to validate token and check tokenVersion
    const payload = await requireAuth(request)
    
    const userId = parseInt(payload.sub)
    const user = await findUserById(userId)

    if (!user) {
      return respondError({ status: 404, code: 'USER_NOT_FOUND', message: 'User not found' })
    }

    // Collect all unique permissions from all roles
    const allPermissions = new Set()
    user.roles?.forEach(userRole => {
      userRole.role.rolePermissions?.forEach(rolePermission => {
        if (rolePermission.permission?.key) {
          allPermissions.add(rolePermission.permission.key)
        }
      })
    })

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status?.key,
      roles: user.roles?.map(r => r.role.key) || [],
      avatar: user.avatar || null,
      permissions: Array.from(allPermissions),
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
      },
    })
  } catch (error) {
    // Don't log 401 errors as error (expected for unauthenticated users)
    if (error.status === 401 || error.code === 'UNAUTHORIZED') {
      // Just return the error response without logging
      return respondError(error)
    }
    
    // Log other errors
    logger.error('Error in /api/auth/me', { error: error.message, stack: error.stack })
    return respondError(error)
  }
}

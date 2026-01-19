import { NextResponse } from 'next/server'
import { respondError } from '../../../../lib/response.js'
import { parseAccessToken } from '../../../../modules/auth/services/token.service.js'
import { getCookie } from '../../../../lib/cookies.js'
import { COOKIE_NAMES } from '../../../../config/cookie.config.js'
import { findUserById } from '../../../../modules/auth/repositories/user.repository.js'
import logger from '../../../../lib/logger.js'

export async function GET(request) {
  try {
    const accessToken = getCookie(request, COOKIE_NAMES.access)
    
    if (!accessToken) {
      return respondError({ status: 401, code: 'NO_ACCESS_TOKEN', message: 'Access token missing' })
    }

    let payload
    try {
      payload = parseAccessToken(accessToken)
    } catch (error) {
      logger.warn('Invalid access token', { error: error.message })
      return respondError({ status: 401, code: 'INVALID_ACCESS_TOKEN', message: 'Access token invalid or expired' })
    }

    const userId = parseInt(payload.sub)
    const user = await findUserById(userId)

    if (!user) {
      return respondError({ status: 404, code: 'USER_NOT_FOUND', message: 'User not found' })
    }

    // Collect all unique permissions from all roles
    const allPermissions = new Set()
    user.roles?.forEach(userRole => {
      userRole.role.permissions?.forEach(rolePermission => {
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
      permissions: Array.from(allPermissions),
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
      },
    })
  } catch (error) {
    logger.error('Error in /api/auth/me', { error: error.message, stack: error.stack })
    return respondError({ status: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' })
  }
}

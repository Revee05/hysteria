import { NextResponse } from 'next/server'
import { respondError } from '../../../../lib/response.js'
import { requireAuth } from '../../../../lib/helper/auth.helper.js'
import { findUserById, updateUserById } from '../../../../modules/auth/repositories/user.repository.js'
import { hashUserPassword } from '../../../../modules/auth/services/password.service.js'
import logger from '../../../../lib/logger.js'
import Uploads from '../../../../lib/upload/uploads.js'

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

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
export async function PATCH(request) {
  try {
    const payload = await requireAuth(request)
    const userId = parseInt(payload.sub)
    
    let updateData = {}
    let file = null
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      if (formData.has('name')) updateData.name = formData.get('name')
      if (formData.has('email')) {
        const email = formData.get('email')
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Format email tidak valid' })
        }
        updateData.email = email
      }
      
      if (formData.has('password') && formData.get('password').trim() !== '') {
        updateData.password = await hashUserPassword(formData.get('password'))
      }
      
      file = formData.get('file')
    } else {
      const body = await request.json()
      
      if (body.name !== undefined) updateData.name = body.name
      
      if (body.email !== undefined) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
          return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Format email tidak valid' })
        }
        updateData.email = body.email
      }
      
      if (body.avatar !== undefined) {
        updateData.avatar = body.avatar
      }
      
      if (body.password && body.password.trim() !== '') {
        updateData.password = await hashUserPassword(body.password)
      }
    }

    // Handle File Upload if present
    if (file && file instanceof Blob) {
      const user = await findUserById(userId)
      const uploads = new Uploads()
      
      // Delete old avatar if exists
      if (user.avatar) {
        try {
          await uploads.deleteFile(user.avatar)
        } catch (err) {
          logger.warn('Failed to delete old avatar', { userId, oldAvatar: user.avatar, error: err.message })
        }
      }
      
      // Upload new avatar
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadResult = await uploads.handleUpload({
        buffer,
        name: file.name || 'avatar.png',
        mimetype: file.type || 'image/png',
        size: file.size
      })
      
      updateData.avatar = uploadResult.url
    }

    if (Object.keys(updateData).length === 0) {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Tidak ada data untuk diperbarui' })
    }

    const updatedUser = await updateUserById(userId, updateData)

    // Collect all unique permissions from all roles
    const allPermissions = new Set()
    updatedUser.roles?.forEach(userRole => {
      userRole.role.rolePermissions?.forEach(rolePermission => {
        if (rolePermission.permission?.key) {
          allPermissions.add(rolePermission.permission.key)
        }
      })
    })

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      status: updatedUser.status?.key,
      roles: updatedUser.roles?.map(r => r.role.key) || [],
      avatar: updatedUser.avatar || null,
      permissions: Array.from(allPermissions),
    }

    logger.info('User profile updated', { userId: updatedUser.id })

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
      },
    })
  } catch (error) {
    logger.error('Error updating profile in /api/auth/me', { error: error.message, stack: error.stack })
    return respondError(error)
  }
}

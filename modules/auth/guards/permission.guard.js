import { NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/helper/auth.helper.js'
import { AppError } from '../../../lib/response.js'

/**
 * Middleware-like helper to require specific permissions.
 * Usage: const permCheck = await requirePermissions(['users.read'])(request)
 * If not allowed, it returns a NextResponse (to be returned by the route).
 * If allowed, it returns undefined.
 */
export function requirePermissions(requiredPermissions = []) {
  return async function (request) {
    try {
      const payload = await requireAuth(request) // will throw AppError on unauthorized

      const userPermissions = Array.isArray(payload.permissions) ? payload.permissions : []

      const needs = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

      const missing = needs.filter(p => !userPermissions.includes(p))
      if (missing.length > 0) {
        return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, { status: 403 })
      }

      // allowed
      return undefined
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ success: false, error: { code: err.code || 'ERROR', message: err.message } }, { status: err.status || 400 })
      }
      console.error('Permission check failed', err)
      return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Permission check failed' } }, { status: 500 })
    }
  }
}

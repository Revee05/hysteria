import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '../../../../../../lib/response.js';
import { requireAuthWithPermission } from '../../../../../../lib/helper/permission.helper.js';
import logger from '../../../../../../lib/logger.js';

import { 
  findUserById, 
  updateUserById,
  closePreviousStatusHistory,
  createStatusHistory 
} from '../../../../../../modules/admin/users/repositories/user.repository.js';

/**
 * PUT /api/admin/users/[id]/status
 * Change user status with reason tracking
 * Required permission: user.status.update
 */
export async function PUT(request, { params }) {
  try {
    // Require authentication and 'user.status.update' permission
    const user = await requireAuthWithPermission(request, 'user.status.update');

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (!userId || isNaN(userId)) {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid user ID' })
    }

    const body = await request.json();
    const { statusId, reason } = body;

    if (!statusId) {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Status ID is required' })
    }

    if (!reason || reason.trim() === '') {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Reason for status change is required' })
    }

    // Check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return respondError({ status: 404, code: 'USER_NOT_FOUND', message: 'User not found' })
    }

    // Check if status is actually changing
    if (existingUser.statusId === statusId) {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'User already has this status' })
    }

    // Update user status
    const updatedUser = await updateUserById(userId, {
      statusId,
      tokenVersion: { increment: 1 }, // Invalidate existing tokens
    });

    // Close previous status history records
    await closePreviousStatusHistory(userId);

    // Create new status history record
    await createStatusHistory({
      userId,
      statusId,
      reason: reason.trim(),
      startAt: new Date(),
      endAt: null, // null = permanent until changed again
    });

    return respondSuccess({ user: updatedUser });
  } catch (error) {
    logger.error('Error updating user status', { error: error && error.message ? error.message : error })
    return respondError(error)
  }
}

/**
 * GET /api/admin/users/[id]/status/history
 * Get user status change history
 * Required permission: users.read
 */
// Note: history endpoint implemented in separate file: status/history/route.js

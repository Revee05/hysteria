import { respondSuccess, respondError } from '../../../../../../../lib/response.js';
import { requireAuthWithPermission } from '../../../../../../../lib/helper/permission.helper.js';
import { getUserStatusHistory } from '../../../../../../../modules/admin/users/repositories/user.repository.js';
import logger from '../../../../../../../lib/logger.js';

/**
 * GET /api/admin/users/[id]/status/history
 * Get user status change history
 * Required permission: user.status.get
 */
export async function GET(request, { params }) {
  try {
    // Require authentication and 'user.status.get' permission
    const user = await requireAuthWithPermission(request, 'user.status.get');

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (!userId || isNaN(userId)) {
      return respondError({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid user ID' })
    }

    const history = await getUserStatusHistory(userId);

    return respondSuccess({ history });
  } catch (error) {
    logger.error('Error fetching user status history', { error: error && error.message ? error.message : error })
    return respondError(error)
  }
}

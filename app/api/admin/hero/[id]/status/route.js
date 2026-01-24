import { respondSuccess, respondError, AppError } from "../../../../../../lib/response";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper";
import * as heroService from "../../../../../../modules/admin/hero/services/hero.service.js";
import logger from "../../../../../../lib/logger.js";

// PATCH - update only isActive status for a hero
export async function PATCH(request, { params }) {
  try {
    await requireAuthWithPermission(request, "hero.update");

    // Resolve params (Next passes params as a Promise in dynamic API routes)
    const resolvedParams = await params;
    // Log request and resolved params for debugging
    logger.info('API PATCH /api/admin/hero/:id/status called', { url: request.url, params: resolvedParams });

    // Normalize id (resolvedParams.id may be string or array)
    const rawId = Array.isArray(resolvedParams?.id) ? resolvedParams.id[0] : resolvedParams?.id;
    const id = rawId === undefined || rawId === null ? NaN : parseInt(String(rawId), 10);
    if (Number.isNaN(id) || id <= 0) {
      logger.warn('Invalid hero id in request', { rawId });
      return respondError(new AppError('Invalid hero id', 400));
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.isActive === 'undefined') {
      return respondError(new AppError('Missing isActive in request body', 400));
    }

    const isActive = body.isActive === true || body.isActive === 'true' || body.isActive === '1';

    // Use existing service to perform a partial update (validation handled there)
    const updated = await heroService.updateHero(id, { isActive });

    logger.info('Hero status updated', { heroId: updated?.id, isActive: updated?.isActive });

    return respondSuccess(updated, 200);
  } catch (error) {
    logger.error('Error updating hero status', { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError('Failed to update hero status', 500));
  }
}

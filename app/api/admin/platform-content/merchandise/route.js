import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import * as merchService from '@/modules/admin/platform/services/link.service.js';

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const item = await merchService.getMerchandise();

    return respondSuccess({ item }, 200);
  } catch (error) {
    logger.error('Error fetching merchandise item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch merchandise item', status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const body = await request.json();
    const updated = await merchService.updateMerchandise(body);

    return respondSuccess({ item: updated }, 200);
  } catch (error) {
    logger.error('Error updating merchandise item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to update merchandise item', status: 500 });
  }
}

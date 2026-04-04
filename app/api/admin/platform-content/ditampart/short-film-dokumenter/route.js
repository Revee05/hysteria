import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import * as ditampartService from '@/modules/admin/platform/services/ditampart.service.js';

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const item = await ditampartService.getShortFilmDokumenter();

    return respondSuccess({ item }, 200);
  } catch (error) {
    logger.error('Error fetching Short Film Dokumenter item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch Short Film Dokumenter item', status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const body = await request.json();
    const updated = await ditampartService.updateShortFilmDokumenter(body);

    return respondSuccess({ item: updated }, 200);
  } catch (error) {
    logger.error('Error updating Short Film Dokumenter item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to update Short Film Dokumenter item', status: 500 });
  }
}

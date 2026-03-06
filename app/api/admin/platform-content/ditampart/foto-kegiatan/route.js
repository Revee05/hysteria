import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import * as ditampartService from '@/modules/admin/platform/services/ditampart.service.js';

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const item = await ditampartService.getFotoKegiatan();

    return respondSuccess({ item }, 200);
  } catch (error) {
    logger.error('Error fetching Foto Kegiatan item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch Foto Kegiatan item', status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const body = await request.json();
    const updated = await ditampartService.updateFotoKegiatan(body);

    return respondSuccess({ item: updated }, 200);
  } catch (error) {
    logger.error('Error updating Foto Kegiatan item', { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to update Foto Kegiatan item', status: 500 });
  }
}

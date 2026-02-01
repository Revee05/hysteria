import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import { reorderCategoryItems } from '@/modules/admin/categories/index.js';

// ============================================================================
// POST - Bulk reorder items
// Body: { items: [{ id: 1, order: 0 }, { id: 2, order: 1 }] }
// ============================================================================

export async function POST(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const body = await request.json();
    const result = await reorderCategoryItems(categoryId, body.items);

    return respondSuccess(result, 200);

  } catch (error) {
    logger.error('Error reordering category items:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to reorder items', status: 500 });
  }
}

import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import { getCategoryItemsTree, createCategoryItem } from '@/modules/admin/categories/index.js';

// ============================================================================
// GET - Fetch all items in tree structure
// ============================================================================

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const result = await getCategoryItemsTree(categoryId);

    logger.info('Admin fetched category items', { categoryId, itemCount: result.totalItems });

    return respondSuccess(result, 200);

  } catch (error) {
    logger.error('Error fetching category items:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch category items', status: 500 });
  }
}

// ============================================================================
// POST - Create new category item
// ============================================================================

export async function POST(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.create');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const body = await request.json();
    const item = await createCategoryItem(categoryId, body);

    return respondSuccess({ item }, 201);

  } catch (error) {
    logger.error('Error creating category item:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to create category item', status: 500 });
  }
}

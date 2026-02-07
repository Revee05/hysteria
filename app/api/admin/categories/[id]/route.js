import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import { getCategoryById, updateCategory, deleteCategory } from '@/modules/admin/categories/index.js';

// ============================================================================
// GET - Fetch single category
// ============================================================================

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const category = await getCategoryById(categoryId);

    logger.info('Admin fetched category', { categoryId });

    return respondSuccess({ category }, 200);

  } catch (error) {
    logger.error('Error fetching category:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch category', status: 500 });
  }
}

// ============================================================================
// PUT - Update category
// ============================================================================

export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const body = await request.json();
    const category = await updateCategory(categoryId, body);

    return respondSuccess({ category }, 200);

  } catch (error) {
    logger.error('Error updating category:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to update category', status: 500 });
  }
}

// ============================================================================
// DELETE - Remove category (cascade deletes items)
// ============================================================================

export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.delete');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const result = await deleteCategory(categoryId);

    return respondSuccess(result, 200);

  } catch (error) {
    logger.error('Error deleting category:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to delete category', status: 500 });
  }
}

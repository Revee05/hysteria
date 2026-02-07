import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import { getCategoryItemById, updateCategoryItem, deleteCategoryItem } from '@/modules/admin/categories/index.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const parseIds = (id, itemId) => {
  const categoryId = parseInt(id);
  const itemIdInt = parseInt(itemId);
  
  if (!categoryId || isNaN(categoryId) || !itemIdInt || isNaN(itemIdInt)) {
    return null;
  }
  
  return { categoryId, itemIdInt };
};

// ============================================================================
// GET - Fetch single item
// ============================================================================

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id, itemId } = await params;
    const ids = parseIds(id, itemId);
    
    if (!ids) {
      return respondError({ message: 'Invalid ID', status: 400 });
    }

    const { categoryId, itemIdInt } = ids;
    const item = await getCategoryItemById(itemIdInt, categoryId);

    logger.info('Admin fetched category item', { itemId: itemIdInt });

    return respondSuccess({ item }, 200);

  } catch (error) {
    logger.error('Error fetching category item (admin):', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch category item', status: 500 });
  }
}

// ============================================================================
// PUT - Update item
// ============================================================================

export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const { id, itemId } = await params;
    const ids = parseIds(id, itemId);
    
    if (!ids) {
      return respondError({ message: 'Invalid ID', status: 400 });
    }

    const { categoryId, itemIdInt } = ids;
    const body = await request.json();
    
    const item = await updateCategoryItem(itemIdInt, categoryId, body);

    return respondSuccess({ item }, 200);

  } catch (error) {
    logger.error('Error updating category item:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to update category item', status: 500 });
  }
}

// ============================================================================
// DELETE - Remove item (cascade deletes children)
// ============================================================================

export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.delete');

    const { id, itemId } = await params;
    const ids = parseIds(id, itemId);
    
    if (!ids) {
      return respondError({ message: 'Invalid ID', status: 400 });
    }

    const { categoryId, itemIdInt } = ids;
    const result = await deleteCategoryItem(itemIdInt, categoryId);

    return respondSuccess(result, 200);

  } catch (error) {
    logger.error('Error deleting category item:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to delete category item', status: 500 });
  }
}

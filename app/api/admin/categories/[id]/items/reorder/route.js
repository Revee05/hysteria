import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma.js';
import { respondSuccess, respondError } from '../../../../../../../lib/response.js';
import logger from '../../../../../../../lib/logger.js';
import { requireAuthWithPermission } from '../../../../../../../lib/helper/permission.helper.js';

/**
 * POST /api/admin/categories/[id]/items/reorder
 * Bulk update order untuk items
 * Body: { items: [{ id: 1, order: 0 }, { id: 2, order: 1 }] }
 */
export async function POST(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return respondError({ message: 'Items array is required', status: 400 });
    }

    // Validate all items belong to this category
    const itemIds = items.map(item => item.id);
    const existingItems = await prisma.categoryItem.findMany({
      where: {
        id: { in: itemIds },
        categoryId
      }
    });

    if (existingItems.length !== itemIds.length) {
      return respondError({ message: 'Some items do not belong to this category', status: 400 });
    }

    // Bulk update using transaction
    const updates = items.map(item => 
      prisma.categoryItem.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );

    await prisma.$transaction(updates);

    logger.info('Admin reordered category items', { 
      categoryId, 
      itemCount: items.length 
    });

    return respondSuccess({ 
      message: 'Items reordered successfully',
      updatedCount: items.length
    }, 200);

  } catch (error) {
    logger.error('Error reordering category items:', error);
    return respondError({ message: 'Failed to reorder items', status: 500 });
  }
}

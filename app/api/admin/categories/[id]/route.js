import { prisma } from '../../../../../../lib/prisma.js';
import { respondSuccess, respondError } from '../../../../../../lib/response.js';
import logger from '../../../../../../lib/logger.js';
import { requireAuthWithPermission } from '../../../../../../lib/helper/permission.helper.js';
import { buildTreeFromPrisma } from '../../../../../../lib/helper/tree.helper.js';

/**
 * GET /api/admin/categories/[id]
 * Get single category dengan detail lengkap
 */
export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        isActive: true,
        requiredPermissionId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!category) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    logger.info('Admin fetched category', { categoryId });

    return respondSuccess({ category }, 200);

  } catch (error) {
    logger.error('Error fetching category (admin):', error);
    return errorResponse('Failed to fetch category', 500);
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Update category
 */
export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.update');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    const body = await request.json();
    const { title, slug, description, order, isActive, requiredPermissionId } = body;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existing) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return respondError({ message: 'Category with this slug already exists', status: 400 });
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        ...(requiredPermissionId !== undefined && { requiredPermissionId })
      }
    });

    logger.info('Admin updated category', { 
      categoryId, 
      changes: Object.keys(body) 
    });

    return respondSuccess({ category }, 200);

  } catch (error) {
    logger.error('Error updating category:', error);
    return respondError({ message: 'Failed to update category', status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete category (cascade delete items)
 */
export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.delete');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        slug: true,
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!existing) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    // Delete category (cascade will delete items)
    await prisma.category.delete({
      where: { id: categoryId }
    });

    logger.info('Admin deleted category', { 
      categoryId, 
      slug: existing.slug,
      itemsDeleted: existing._count.items
    });

    return respondSuccess({ 
      message: 'Category deleted successfully',
      deletedItems: existing._count.items
    }, 200);

  } catch (error) {
    logger.error('Error deleting category:', error);
    return respondError({ message: 'Failed to delete category', status: 500 });
  }
}

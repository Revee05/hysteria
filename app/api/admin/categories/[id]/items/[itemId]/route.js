import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.js';
import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const validateIds = (id, itemId) => {
  const categoryId = parseInt(id);
  const itemIdInt = parseInt(itemId);
  
  if (!categoryId || isNaN(categoryId) || !itemIdInt || isNaN(itemIdInt)) {
    return { valid: false, error: 'Invalid ID' };
  }
  
  return { valid: true, categoryId, itemIdInt };
};

// ============================================================================
// GET - Fetch single item
// ============================================================================

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id, itemId } = await params;
    const validation = validateIds(id, itemId);
    
    if (!validation.valid) {
      return respondError({ message: validation.error, status: 400 });
    }

    const { categoryId, itemIdInt } = validation;

    const item = await prisma.categoryItem.findFirst({
      where: { 
        id: itemIdInt,
        categoryId 
      },
      select: {
        id: true,
        categoryId: true,
        title: true,
        slug: true,
        url: true,
        parentId: true,
        order: true,
        meta: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!item) {
      return respondError({ message: 'Category item not found', status: 404 });
    }

    logger.info('Admin fetched category item', { itemId: itemIdInt });

    return respondSuccess({ item }, 200);

  } catch (error) {
    logger.error('Error fetching category item (admin):', error);
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
    const validation = validateIds(id, itemId);
    
    if (!validation.valid) {
      return respondError({ message: validation.error, status: 400 });
    }

    const { categoryId, itemIdInt } = validation;

    // Check if item exists
    const existing = await prisma.categoryItem.findFirst({
      where: { 
        id: itemIdInt,
        categoryId 
      }
    });

    if (!existing) {
      return respondError({ message: 'Category item not found', status: 404 });
    }

    const body = await request.json();
    const { title, slug, url, parentId, order, meta, isActive } = body;

    // Check if new parent exists (if provided)
    if (parentId !== undefined && parentId !== null && parentId !== existing.parentId) {
      // Check circular reference
      if (parentId === itemIdInt) {
        return respondError({ message: 'Cannot set item as its own parent', status: 400 });
      }

      const parent = await prisma.categoryItem.findFirst({
        where: { 
          id: parentId,
          categoryId 
        }
      });

      if (!parent) {
        return respondError({ message: 'Parent item not found in this category', status: 400 });
      }

      // TODO: Add recursive check for circular references
    }

    // Update item
    const item = await prisma.categoryItem.update({
      where: { id: itemIdInt },
      data: {
        ...(title && { title }),
        ...(slug !== undefined && { slug }),
        ...(url !== undefined && { url }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
        ...(meta !== undefined && { meta }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info('Admin updated category item', { 
      itemId: itemIdInt,
      changes: Object.keys(body) 
    });

    return respondSuccess({ item }, 200);

  } catch (error) {
    logger.error('Error updating category item:', error);
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
    const validation = validateIds(id, itemId);
    
    if (!validation.valid) {
      return respondError({ message: validation.error, status: 400 });
    }

    const { categoryId, itemIdInt } = validation;

    // Check if item exists
    const existing = await prisma.categoryItem.findFirst({
      where: { 
        id: itemIdInt,
        categoryId 
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!existing) {
      return respondError({ message: 'Category item not found', status: 404 });
    }

    // Delete item (cascade will delete children)
    await prisma.categoryItem.delete({
      where: { id: itemIdInt }
    });

    logger.info('Admin deleted category item', { 
      itemId: itemIdInt,
      title: existing.title,
      childrenDeleted: existing._count.children
    });

    return respondSuccess({ 
      message: 'Category item deleted successfully',
      deletedChildren: existing._count.children
    }, 200);

  } catch (error) {
    logger.error('Error deleting category item:', error);
    return respondError({ message: 'Failed to delete category item', status: 500 });
  }
}

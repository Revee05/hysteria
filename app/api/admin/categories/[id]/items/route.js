import { prisma } from '../../../../../../lib/prisma.js';
import { respondSuccess, respondError } from '../../../../../../lib/response.js';
import logger from '../../../../../../lib/logger.js';
import { requireAuthWithPermission } from '../../../../../../lib/helper/permission.helper.js';
import { buildTreeFromPrisma } from '../../../../../../lib/helper/tree.helper.js';

/**
 * GET /api/admin/categories/[id]/items
 * Get all items untuk category tertentu dalam tree structure
 */
export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const { id } = await params;
    const categoryId = parseInt(id);

    if (!categoryId || isNaN(categoryId)) {
      return respondError({ message: 'Invalid category ID', status: 400 });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    if (!category) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    // Fetch all items with nested children (up to 5 levels deep)
    const items = await prisma.categoryItem.findMany({
      where: { 
        categoryId,
        parentId: null  // Only root items
      },
      select: {
        id: true,
        title: true,
        slug: true,
        url: true,
        order: true,
        isActive: true,
        meta: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
            url: true,
            order: true,
            isActive: true,
            meta: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
            children: {
              select: {
                id: true,
                title: true,
                slug: true,
                url: true,
                order: true,
                isActive: true,
                meta: true,
                parentId: true,
                createdAt: true,
                updatedAt: true,
                children: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    url: true,
                    order: true,
                    isActive: true,
                    meta: true,
                    parentId: true,
                    createdAt: true,
                    updatedAt: true,
                    children: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        url: true,
                        order: true,
                        isActive: true,
                        meta: true,
                        parentId: true,
                        createdAt: true,
                        updatedAt: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Build tree
    const tree = buildTreeFromPrisma(items);

    logger.info('Admin fetched category items', { 
      categoryId, 
      itemCount: items.length 
    });

    return respondSuccess({ 
      category,
      items: tree,
      totalItems: items.length
    }, 200);

  } catch (error) {
    logger.error('Error fetching category items (admin):', error);
    return respondError({ message: 'Failed to fetch category items', status: 500 });
  }
}

/**
 * POST /api/admin/categories/[id]/items
 * Create new category item
 */
export async function POST(request, { params }) {
  try {
    await requireAuthWithPermission(request, 'categories.create');

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
    const { title, slug, url, parentId, order, meta, isActive } = body;

    // Validation
    if (!title) {
      return respondError({ message: 'Title is required', status: 400 });
    }

    // Check if parent exists (if provided)
    if (parentId) {
      const parent = await prisma.categoryItem.findFirst({
        where: { 
          id: parentId,
          categoryId 
        }
      });

      if (!parent) {
        return respondError({ message: 'Parent item not found in this category', status: 400 });
      }
    }

    // Create item
    const item = await prisma.categoryItem.create({
      data: {
        categoryId,
        title,
        slug: slug || null,
        url: url || null,
        parentId: parentId || null,
        order: order || 0,
        meta: meta || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    logger.info('Admin created category item', { 
      categoryId, 
      itemId: item.id 
    });

    return respondSuccess({ item }, 201);

  } catch (error) {
    logger.error('Error creating category item:', error);
    return respondError({ message: 'Failed to create category item', status: 500 });
  }
}

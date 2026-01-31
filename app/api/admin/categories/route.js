import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.js';
import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCategoryResponse = (cat) => ({
  id: cat.id,
  title: cat.title,
  slug: cat.slug,
  description: cat.description,
  order: cat.order,
  isActive: cat.isActive,
  requiredPermissionId: cat.requiredPermissionId,
  itemCount: cat._count.items,
  createdAt: cat.createdAt,
  updatedAt: cat.updatedAt
});

// ============================================================================
// GET - List all categories
// ============================================================================

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const categories = await prisma.category.findMany({
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
          select: { items: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    const formatted = categories.map(formatCategoryResponse);

    logger.info('Admin fetched categories', { count: categories.length });

    return respondSuccess({ categories: formatted }, 200);

  } catch (error) {
    logger.error('Error fetching categories:', error);
    return respondError({ message: 'Failed to fetch categories', status: 500 });
  }
}

// ============================================================================
// POST - Create new category
// ============================================================================

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, 'categories.create');

    const body = await request.json();
    const { title, slug, description, order, isActive, requiredPermissionId } = body;

    // Validation
    if (!title || !slug) {
      return respondError({ message: 'Title and slug are required', status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return respondError({ message: 'Category with this slug already exists', status: 400 });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        title,
        slug,
        description: description || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        requiredPermissionId: requiredPermissionId || null
      }
    });

    logger.info('Admin created category', { 
      categoryId: category.id, 
      slug: category.slug 
    });

    return respondSuccess({ category }, 201);

  } catch (error) {
    logger.error('Error creating category:', error);
    return respondError({ message: 'Failed to create category', status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import { requireAuthWithPermission } from '@/lib/helper/permission.helper.js';
import { getAllCategories, createCategory, formatCategoryResponse } from '@/modules/admin/categories/index.js';

// ============================================================================
// GET - List all categories
// ============================================================================

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, 'categories.view');

    const categories = await getAllCategories();
    const formatted = categories.map(formatCategoryResponse);

    logger.info('Admin fetched categories', { count: categories.length });

    return respondSuccess({ categories: formatted }, 200);

  } catch (error) {
    logger.error('Error fetching categories:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
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
    const category = await createCategory(body);

    return respondSuccess({ category }, 201);

  } catch (error) {
    logger.error('Error creating category:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to create category', status: 500 });
  }
}

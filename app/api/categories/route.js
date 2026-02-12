import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '../../../lib/response.js';
import logger from '../../../lib/logger.js';
import { getActiveCategories } from '@/modules/admin/categories/index.js';

/**
 * GET /api/categories
 * List semua categories (untuk navigation menu atau admin)
 */
export async function GET(request) {
  try {
    const categories = await getActiveCategories();

    logger.info('Fetched categories list', { count: categories.length });

    return respondSuccess({ categories }, 200);

  } catch (error) {
    logger.error('Error fetching categories:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch categories', status: 500 });
  }
}

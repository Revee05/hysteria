import { NextResponse } from 'next/server';
import { respondSuccess, respondError } from '../../../../lib/response.js';
import logger from '../../../../lib/logger.js';
import { getCategoryBySlugWithItems } from '@/modules/admin/categories/index.js';

/**
 * GET /api/categories/[slug]
 * Fetch category dengan tree structure untuk public consumption
 * Mendukung permission filtering berdasarkan user session (opsional)
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    const response = await getCategoryBySlugWithItems(slug);

    logger.info(`Fetched category tree: ${slug}`, { itemCount: response.items.length });

    return respondSuccess(response, 200);

  } catch (error) {
    logger.error('Error fetching category:', error);
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: 'Failed to fetch category', status: 500 });
  }
}

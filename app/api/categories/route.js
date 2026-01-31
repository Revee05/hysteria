import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';
import { respondSuccess, respondError } from '../../../lib/response.js';
import logger from '../../../lib/logger.js';

/**
 * GET /api/categories
 * List semua categories (untuk navigation menu atau admin)
 */
export async function GET(request) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        isActive: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      isActive: cat.isActive,
      itemCount: cat._count.items
    }));

    logger.info('Fetched categories list', { count: categories.length });

    return respondSuccess({ categories: formatted }, 200);

  } catch (error) {
    logger.error('Error fetching categories:', error);
    return respondError({ message: 'Failed to fetch categories', status: 500 });
  }
}

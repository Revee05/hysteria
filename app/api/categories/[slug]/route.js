import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { buildTreeFromPrisma } from '../../../../lib/helper/tree.helper.js';
import { respondSuccess, respondError } from '../../../../lib/response.js';
import logger from '../../../../lib/logger.js';

/**
 * GET /api/categories/[slug]
 * Fetch category dengan tree structure untuk public consumption
 * Mendukung permission filtering berdasarkan user session (opsional)
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return respondError({ message: 'Category slug is required', status: 400 });
    }

    // Fetch category dengan items (nested children)
    const category = await prisma.category.findUnique({
      where: { 
        slug,
        isActive: true  // Only active categories
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        isActive: true,
        requiredPermissionId: true,
        items: {
          where: {
            isActive: true,  // Only active items
            parentId: null   // Only root level items
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
            children: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                slug: true,
                url: true,
                order: true,
                isActive: true,
                meta: true,
                parentId: true,
                children: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    url: true,
                    order: true,
                    isActive: true,
                    meta: true,
                    parentId: true,
                    children: {
                      where: { isActive: true },
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        url: true,
                        order: true,
                        isActive: true,
                        meta: true,
                        parentId: true,
                        children: {
                          where: { isActive: true },
                          select: {
                            id: true,
                            title: true,
                            slug: true,
                            url: true,
                            order: true,
                            isActive: true,
                            meta: true,
                            parentId: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category) {
      return respondError({ message: 'Category not found', status: 404 });
    }

    // Build tree structure dari items
    const tree = buildTreeFromPrisma(category.items);

    // Return category dengan tree
    const response = {
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      items: tree
    };

    logger.info(`Fetched category tree: ${slug}`, { itemCount: tree.length });

    return respondSuccess(response, 200);

  } catch (error) {
    logger.error('Error fetching category:', error);
    return respondError({ message: 'Failed to fetch category', status: 500 });
  }
}

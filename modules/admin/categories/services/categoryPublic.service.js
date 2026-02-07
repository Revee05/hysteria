import { AppError } from '../../../../lib/response.js';
import * as categoryRepository from '../repositories/category.repository.js';
import { prisma } from '../../../../lib/prisma.js';
import logger from '../../../../lib/logger.js';
import { buildTreeFromPrisma } from '../../../../lib/helper/tree.helper.js';

/**
 * Get all active categories (for public consumption)
 * @returns {Promise<Array>}
 */
export async function getActiveCategories() {
  try {
    const categories = await categoryRepository.findAllCategories({ isActive: true });
    
    // Format response untuk public (tanpa sensitive data)
    const formatted = categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      isActive: cat.isActive,
      itemCount: cat._count?.items || 0
    }));

    return formatted;
  } catch (error) {
    logger.error('Error in getActiveCategories service', { error: error.message });
    throw new AppError('Failed to fetch categories', 500);
  }
}

/**
 * Get category by slug with nested items tree (for public consumption)
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export async function getCategoryBySlugWithItems(slug) {
  if (!slug) {
    throw new AppError('Category slug is required', 400);
  }

  try {
    // Fetch category dengan nested items (up to 5 levels deep)
    const category = await prisma.category.findUnique({
      where: { 
        slug,
        isActive: true
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
            isActive: true,
            parentId: null
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
                            parentId: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Build tree structure dari items
    const tree = buildTreeFromPrisma(category.items);

    // Return category dengan tree (tanpa sensitive data)
    return {
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      items: tree
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching category by slug with items', { slug, error: error.message });
    throw new AppError('Failed to fetch category', 500);
  }
}

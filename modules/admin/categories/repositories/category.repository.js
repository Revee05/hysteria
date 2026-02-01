import { prisma } from '../../../../lib/prisma.js';

/**
 * Find all categories with optional filters and sorting
 * @param {Object} options
 * @param {boolean|null} options.isActive - Filter by active status
 * @returns {Promise<Array>}
 */
export async function findAllCategories({ isActive = null } = {}) {
  const where = isActive !== null ? { isActive } : {};

  return await prisma.category.findMany({
    where,
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
}

/**
 * Find category by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function findCategoryById(id) {
  return await prisma.category.findUnique({
    where: { id },
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
    }
  });
}

/**
 * Find category by slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function findCategoryBySlug(slug) {
  return await prisma.category.findUnique({
    where: { slug }
  });
}

/**
 * Create new category
 * @param {Object} data
 * @param {string} data.title - Category title
 * @param {string} data.slug - Unique slug
 * @param {string} data.description - Category description
 * @param {number} data.order - Display order
 * @param {boolean} data.isActive - Active status
 * @param {number} data.requiredPermissionId - Required permission ID
 * @returns {Promise<Object>}
 */
export async function createCategory(data) {
  return await prisma.category.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      requiredPermissionId: data.requiredPermissionId || null
    }
  });
}

/**
 * Update category
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateCategory(id, data) {
  return await prisma.category.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.requiredPermissionId !== undefined && { requiredPermissionId: data.requiredPermissionId })
    }
  });
}

/**
 * Delete category
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteCategory(id) {
  return await prisma.category.delete({
    where: { id }
  });
}

/**
 * Count categories
 * @param {Object} where - Filter conditions
 * @returns {Promise<number>}
 */
export async function countCategories(where = {}) {
  return await prisma.category.count({ where });
}

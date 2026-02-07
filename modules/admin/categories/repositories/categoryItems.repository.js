import { prisma } from '../../../../lib/prisma.js';

/**
 * Build nested select for deep item trees
 * @param {number} depth
 * @returns {Object}
 */
const buildNestedSelect = (depth = 4) => {
  const baseFields = {
    id: true,
    title: true,
    slug: true,
    url: true,
    order: true,
    isActive: true,
    meta: true,
    parentId: true,
    createdAt: true,
    updatedAt: true
  };

  if (depth === 0) return baseFields;
  
  return {
    ...baseFields,
    children: { select: buildNestedSelect(depth - 1) }
  };
};

/**
 * Find all items for a category in tree structure
 * @param {number} categoryId
 * @param {number} depth - Nesting depth (default: 4)
 * @returns {Promise<Array>}
 */
export async function findItemsTree(categoryId, depth = 4) {
  return await prisma.categoryItem.findMany({
    where: { categoryId, parentId: null },
    select: buildNestedSelect(depth),
    orderBy: { order: 'asc' }
  });
}

/**
 * Find all items for a category (flat list)
 * @param {number} categoryId
 * @returns {Promise<Array>}
 */
export async function findAllItems(categoryId) {
  return await prisma.categoryItem.findMany({
    where: { categoryId },
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
      updatedAt: true
    },
    orderBy: { order: 'asc' }
  });
}

/**
 * Find item by ID
 * @param {number} itemId
 * @param {number} categoryId
 * @returns {Promise<Object|null>}
 */
export async function findItemById(itemId, categoryId) {
  return await prisma.categoryItem.findFirst({
    where: { 
      id: itemId,
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
}

/**
 * Create new category item
 * @param {Object} data
 * @param {number} data.categoryId - Category ID
 * @param {string} data.title - Item title
 * @param {string} data.slug - Item slug
 * @param {string} data.url - Item URL
 * @param {number} data.parentId - Parent item ID
 * @param {number} data.order - Display order
 * @param {Object} data.meta - Additional metadata
 * @param {boolean} data.isActive - Active status
 * @returns {Promise<Object>}
 */
export async function createItem(data) {
  return await prisma.categoryItem.create({
    data: {
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug || null,
      url: data.url || null,
      parentId: data.parentId || null,
      order: data.order || 0,
      meta: data.meta || null,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
}

/**
 * Update category item
 * @param {number} itemId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateItem(itemId, data) {
  return await prisma.categoryItem.update({
    where: { id: itemId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.meta !== undefined && { meta: data.meta }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    }
  });
}

/**
 * Delete category item
 * @param {number} itemId
 * @returns {Promise<Object>}
 */
export async function deleteItem(itemId) {
  return await prisma.categoryItem.delete({
    where: { id: itemId }
  });
}

/**
 * Bulk reorder items using transaction
 * @param {Array<{id: number, order: number}>} items
 * @returns {Promise<void>}
 */
export async function bulkReorderItems(items) {
  const updates = items.map(item => 
    prisma.categoryItem.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  );

  await prisma.$transaction(updates);
}

/**
 * Count items in a category
 * @param {number} categoryId
 * @returns {Promise<number>}
 */
export async function countItems(categoryId) {
  return await prisma.categoryItem.count({
    where: { categoryId }
  });
}

/**
 * Find items by IDs and category
 * @param {Array<number>} itemIds
 * @param {number} categoryId
 * @returns {Promise<Array>}
 */
export async function findItemsByIds(itemIds, categoryId) {
  return await prisma.categoryItem.findMany({
    where: { 
      id: { in: itemIds },
      categoryId 
    }
  });
}

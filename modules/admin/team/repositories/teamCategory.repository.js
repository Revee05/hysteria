import { prisma } from "../../../../lib/prisma.js";

/**
 * Find all team categories with optional pagination
 * @param {Object} options
 * @param {number} options.perPage
 * @param {number|null} options.cursor
 * @param {boolean|null} options.isActive
 * @returns {Promise<{ categories: Array, nextCursor: number|null, hasMore: boolean }>}
 */
export async function findAllTeamCategories({ perPage = 50, cursor = null, isActive = null } = {}) {
  const where = isActive !== null ? { isActive } : {};

  const categories = await prisma.teamCategory.findMany({
    where,
    take: perPage + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  const hasMore = categories.length > perPage;
  const returnedCategories = hasMore ? categories.slice(0, perPage) : categories;
  const nextCursor = hasMore ? returnedCategories[returnedCategories.length - 1].id : null;

  return {
    categories: returnedCategories,
    nextCursor,
    hasMore,
  };
}

/**
 * Find all team categories with members
 * @param {Object} options
 * @param {number} options.perPage
 * @param {number|null} options.cursor
 * @param {boolean|null} options.isActive
 * @param {boolean|null} options.memberIsActive
 * @returns {Promise<{ categories: Array, nextCursor: number|null, hasMore: boolean }>}
 */
export async function findTeamCategoriesWithMembers({ perPage = 50, cursor = null, isActive = null, memberIsActive = null } = {}) {
  const where = isActive !== null ? { isActive } : {};
  const memberWhere = memberIsActive !== null ? { isActive: memberIsActive } : {};

  const categories = await prisma.teamCategory.findMany({
    where,
    take: perPage + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: [{ order: "asc" }, { id: "asc" }],
    include: {
      members: {
        where: memberWhere,
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });

  const hasMore = categories.length > perPage;
  const returnedCategories = hasMore ? categories.slice(0, perPage) : categories;
  const nextCursor = hasMore ? returnedCategories[returnedCategories.length - 1].id : null;

  return {
    categories: returnedCategories,
    nextCursor,
    hasMore,
  };
}

/**
 * Find team category by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function findTeamCategoryById(id) {
  return await prisma.teamCategory.findUnique({
    where: { id },
  });
}

/**
 * Find team category by slug + name
 * @param {string} slug
 * @param {string} name
 * @returns {Promise<Object|null>}
 */
export async function findTeamCategoryBySlugName(slug, name) {
  return await prisma.teamCategory.findFirst({
    where: { slug, name },
  });
}

/**
 * Create team category
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createTeamCategory(data) {
  return await prisma.teamCategory.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      order: data.order ?? 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Get max order value for team categories
 * @returns {Promise<number>}
 */
export async function getMaxTeamCategoryOrder() {
  const result = await prisma.teamCategory.aggregate({
    _max: { order: true },
  });
  return Number.isFinite(result?._max?.order) ? result._max.order : -1;
}

/**
 * Update orders for multiple team categories
 * @param {Array<{id:number, order:number}>} items
 * @returns {Promise<Array>}
 */
export async function updateTeamCategoryOrders(items) {
  const updates = items.map((item) =>
    prisma.teamCategory.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );
  return prisma.$transaction(updates);
}

/**
 * Update team category
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateTeamCategory(id, data) {
  return await prisma.teamCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete team category
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteTeamCategory(id) {
  return await prisma.teamCategory.delete({
    where: { id },
  });
}

/**
 * Count team categories
 * @param {Object} where
 * @returns {Promise<number>}
 */
export async function countTeamCategories(where = {}) {
  return await prisma.teamCategory.count({ where });
}

import { prisma } from "../../../../lib/prisma.js";

/**
 * Find team member by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function findTeamMemberById(id) {
  return await prisma.teamMember.findUnique({
    where: { id },
  });
}

/**
 * Find team member by slug + name
 * @param {string} slug
 * @param {string} name
 * @returns {Promise<Object|null>}
 */
export async function findTeamMemberBySlugName(slug, name) {
  return await prisma.teamMember.findFirst({
    where: { slug, name },
  });
}

/**
 * Create team member
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createTeamMember(data) {
  return await prisma.teamMember.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      role: data.role,
      imageUrl: data.imageUrl || null,
      email: data.email || null,
      instagram: data.instagram || null,
      order: data.order ?? 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Get max order value for team members in a category
 * @param {number} categoryId
 * @returns {Promise<number>}
 */
export async function getMaxTeamMemberOrder(categoryId) {
  const result = await prisma.teamMember.aggregate({
    _max: { order: true },
    where: { categoryId },
  });
  return Number.isFinite(result?._max?.order) ? result._max.order : -1;
}

/**
 * Update orders for multiple team members
 * @param {Array<{id:number, order:number, categoryId:number}>} items
 * @returns {Promise<Array>}
 */
export async function updateTeamMemberOrders(items) {
  const updates = items.map((item) =>
    prisma.teamMember.update({
      where: { id: item.id },
      data: { order: item.order, categoryId: item.categoryId },
    }),
  );
  return prisma.$transaction(updates);
}

/**
 * Update team member
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateTeamMember(id, data) {
  return await prisma.teamMember.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete team member
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteTeamMember(id) {
  return await prisma.teamMember.delete({
    where: { id },
  });
}

/**
 * Count team members
 * @param {Object} where
 * @returns {Promise<number>}
 */
export async function countTeamMembers(where = {}) {
  return await prisma.teamMember.count({ where });
}

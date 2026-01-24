import { prisma } from '../../../../lib/prisma.js';

/**
 * Find all hero sections with pagination and filtering
 * @param {Object} options
 * @param {number} options.perPage - Number of items per page (default: 10)
 * @param {number|null} options.cursor - Cursor ID for pagination
 * @param {boolean|null} options.isActive - Filter by active status
 * @returns {Promise<{heroes: Array, nextCursor: number|null, hasMore: boolean}>}
 */
export async function findAllHeroes({ perPage = 10, cursor = null, isActive = null }) {
  const where = isActive !== null ? { isActive } : {};

  const heroes = await prisma.heroSection.findMany({
    where,
    take: perPage + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: 'desc' }, // Newest first
  });

  const hasMore = heroes.length > perPage;
  const returnedHeroes = hasMore ? heroes.slice(0, perPage) : heroes;
  const nextCursor = hasMore ? returnedHeroes[returnedHeroes.length - 1].id : null;

  return {
    heroes: returnedHeroes,
    nextCursor,
    hasMore,
  };
}

/**
 * Find hero by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function findHeroById(id) {
  return await prisma.heroSection.findUnique({
    where: { id },
  });
}

/**
 * Find active hero section
 * @returns {Promise<Object|null>}
 */
export async function findActiveHero() {
  return await prisma.heroSection.findFirst({
    where: { isActive: true },
  });
}

/**
 * Create new hero section
 * @param {Object} data
 * @param {string} data.source - Media URL
 * @param {string} data.title - Hero title
 * @param {string} data.description - Hero description
 * @param {boolean} data.isActive - Active status
 * @returns {Promise<Object>}
 */
export async function createHero(data) {
  // If setting as active, deactivate all others first
  if (data.isActive) {
    await prisma.heroSection.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return await prisma.heroSection.create({
    data,
  });
}

/**
 * Update hero section
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateHero(id, data) {
  // If setting this as active, deactivate all others first
  if (data.isActive) {
    await prisma.heroSection.updateMany({
      where: { isActive: true, id: { not: id } },
      data: { isActive: false },
    });
  }

  return await prisma.heroSection.update({
    where: { id },
    data,
  });
}

/**
 * Delete hero section
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteHero(id) {
  return await prisma.heroSection.delete({
    where: { id },
  });
}

/**
 * Count total heroes
 * @param {Object} where - Filter conditions
 * @returns {Promise<number>}
 */
export async function countHeroes(where = {}) {
  return await prisma.heroSection.count({ where });
}

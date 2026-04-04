import { prisma } from "@/lib/prisma";

/**
 * Find all articles
 */
export async function findAllArticles(where, orderBy, skip = 0, take = 10) {
  return prisma.article.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

/**
 * Find by ID
 */
export async function findArticleById(id) {
  return prisma.article.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
}

/**
 * Find by slug
 */
export async function findArticleBySlug(slug) {
  return prisma.article.findUnique({
    where: { slug },
  });
}

/**
 * Create article (transaction)
 */
export async function createArticle(tx, data) {
  return tx.article.create({ data });
}

/**
 * Update article
 */
export async function updateArticle(id, data) {
  return prisma.article.update({
    where: { id },
    data,
  });
}

/**
 * Update featured image
 */
export async function updateFeaturedImage(id, url) {
  return prisma.article.update({
    where: { id },
    data: { featuredImage: url },
  });
}

/**
 * Soft delete
 */
export async function softDeleteArticle(id) {
  return prisma.article.update({
    where: { id },
    data: { isDeleted: true },
  });
}

import { prisma } from "@/lib/prisma";

export async function findArticles({ status }) {
  return prisma.article.findMany({
    where: {
      isDeleted: false,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export async function createArticle(tx, data) {
  return tx.article.create({
    data,
  });
}

export async function findById(id) {
  return prisma.article.findFirst({
    where: {
      id,
      isDeleted: false,
    },
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

export async function findBySlug(slug) {
  return prisma.article.findUnique({
    where: { slug },
  });
}

export async function softDeleteById(id) {
  return prisma.article.update({
    where: { id },
    data: { isDeleted: true },
  });
}

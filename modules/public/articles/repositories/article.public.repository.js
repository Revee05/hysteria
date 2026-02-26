import { prisma } from "@/lib/prisma";

export async function findPublishedArticles({ search }) {
  return prisma.article.findMany({
    where: {
      isDeleted: false,
      status: "PUBLISHED",
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function findPublishedBySlug(slug) {
  return prisma.article.findFirst({
    where: {
      slug,
      isDeleted: false,
      status: "PUBLISHED",
    },
    include: {
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });
}

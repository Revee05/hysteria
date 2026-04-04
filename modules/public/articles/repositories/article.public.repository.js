import { prisma } from "@/lib/prisma";
import { publishedArticleCondition } from "../query/article.public.query";

export async function findPublishedArticles({
  search,
  category,
  sort,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;

  let orderBy = { publishedAt: "desc" };

  if (sort === "oldest") orderBy = { publishedAt: "asc" };
  if (sort === "az") orderBy = { title: "asc" };
  if (sort === "za") orderBy = { title: "desc" };
  if (sort === "popular") {
    orderBy = {
      views: "desc",
    };
  }
  const where = {
    isDeleted: false,

    ...publishedArticleCondition(),

    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
      ],
    }),

    ...(category &&
      category !== "all" && {
        categories: {
          some: {
            category: {
              title: category,
            },
          },
        },
      }),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,

      include: {
        categories: {
          include: { category: true },
        },
      },
    }),

    prisma.article.count({ where }),
  ]);

  return {
    data: articles,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findPublishedBySlug(slug) {
  return prisma.article.findFirst({
    where: {
      slug,
      isDeleted: false,
      ...publishedArticleCondition(),
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

export async function findRecommendedArticles({
  slug,
  categoryIds,
  limit = 4,
}) {
  return prisma.article.findMany({
    where: {
      slug: {
        not: slug,
      },

      isDeleted: false,

      ...publishedArticleCondition(),

      categories: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
    },

    take: limit,

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

export async function incrementArticleViews(slug) {
  return prisma.article.update({
    where: {
      slug: slug,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}
// repository article untuk tampilan data article di halaman Home
export async function findLatestArticles(limit = 3) {
  return prisma.article.findMany({
    where: {
      isDeleted: false,
      ...publishedArticleCondition(),
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });
}

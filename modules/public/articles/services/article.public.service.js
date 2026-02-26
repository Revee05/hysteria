import {
  findPublishedArticles,
  findPublishedBySlug,
} from "../repositories/article.public.repository";

export async function getPublicArticles({ search }) {
  const articles = await findPublishedArticles({ search });

  return articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    featuredImage: a.featuredImage,
    authorName: a.authorName,
    publishedAt: a.publishedAt,
    categories: a.categories.map((c) => ({
      id: c.category.id,
      title: c.category.title,
    })),
  }));
}

export async function getPublicArticleDetail(slug) {
  const article = await findPublishedBySlug(slug);
  if (!article) return null;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    content:
      typeof article.content === "string"
        ? JSON.parse(article.content)
        : article.content,
    excerpt: article.excerpt,
    featuredImage: article.featuredImage,
    authorName: article.authorName,
    editorName: article.editorName,
    publishedAt: article.publishedAt,

    categories: article.categories.map((c) => ({
      id: c.category.id,
      title: c.category.title,
    })),

    tags: article.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
    })),
  };
}

export async function getRecommendedArticles({ slug, categoryIds }) {
  return prisma.article.findMany({
    where: {
      slug: { not: slug },
      status: "PUBLISHED",
      isDeleted: false,
      ...(categoryIds?.length > 0 && {
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      }),
    },
    take: 4,
    orderBy: {
      publishedAt: "desc",
    },
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

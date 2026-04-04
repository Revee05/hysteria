import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/response";
import logger from "@/lib/logger";
import { createWithUpload } from "@/lib/upload/transactionalUpload";

import {
  findAllArticles,
  findArticleById,
  findArticleBySlug,
  createArticle,
  updateArticle,
  updateFeaturedImage,
  softDeleteArticle,
} from "../repositories/article.repository";

import { validateArticle } from "../validators/article.validator";
import { attachTags, resetTags } from "./tag.service";
import { uploadMedia } from "./media.service";

/* =========================
   SLUG HELPERS
========================= */

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

async function generateUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await findArticleBySlug(slug);
    if (!existing || existing.id === excludeId) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

async function attachCategories(tx, articleId, categoryIds = []) {
  if (!categoryIds || categoryIds.length === 0) return;

  await tx.articleCategory.createMany({
    data: categoryIds.map((categoryId) => ({
      articleId,
      categoryId,
    })),
    skipDuplicates: true,
  });
}

/* =========================
   GET LIST
========================= */

export async function getAllArticles(options = {}) {
  try {
    const { search, category, status, sort, page = 1, limit = 10 } = options;

    const skip = (page - 1) * limit;

    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "az") orderBy = { title: "asc" };
    if (sort === "za") orderBy = { title: "desc" };

    const where = {
      isDeleted: false,

      ...(status && {
        status: status,
      }),

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
      findAllArticles(where, orderBy, skip, limit),
      prisma.article.count({ where }),
    ]);

    const formatted = articles.map(formatArticleList);

    return {
      data: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching articles", { error: error.message });
    throw new AppError("Failed to fetch articles", 500);
  }
}

/* =========================
   GET DETAIL
========================= */

export async function getArticleDetail(id) {
  const article = await findArticleById(id);

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: JSON.parse(article.content),
    excerpt: article.excerpt,
    featuredImage: article.featuredImage,
    featuredImageSource: article.featuredImageSource,
    references: article.references || [],
    authorName: article.authorName,
    editorName: article.editorName,
    status: article.status,
    publishedAt: article.publishedAt,
    categories: article.categories.map((c) => c.category),
    tags: article.tags.map((t) => t.tag),
  };
}

/* =========================
   CREATE
========================= */

export async function createArticleService(data, file) {
  let validated;

  try {
    validated = validateArticle(data);
  } catch (error) {
    throw new AppError(
      error.errors?.[0]?.message || "Invalid article data",
      400,
      "VALIDATION_ERROR",
    );
  }

  const baseSlug = generateSlug(validated.slug || validated.title);
  const slug = await generateUniqueSlug(baseSlug);

  const now = new Date();

  let publishedAt = validated.publishedAt
    ? new Date(validated.publishedAt)
    : null;

  let status = validated.status;

  if (status === "PUBLISHED") {
    // jika kosong → publish sekarang
    if (!publishedAt) {
      publishedAt = now;
    }

    // jika tanggal masa depan → scheduled
    if (publishedAt > now) {
      status = "SCHEDULED";
    }
  }

  return createWithUpload(
    {
      createRecord: async () =>
        prisma.$transaction(async (tx) => {
          const article = await createArticle(tx, {
            title: validated.title,
            slug,
            content: JSON.stringify(validated.content),
            excerpt: validated.excerpt,
            authorName: validated.authorName,
            editorName: validated.editorName,
            status,
            publishedAt,
            references: validated.references,
            featuredImageSource: validated.featuredImageSource,
          });

          //attach category
          await attachCategories(tx, article.id, validated.categoryIds);

          //attach tags
          await attachTags(tx, article.id, validated.tagNames);

          return article;
        }),

      uploadFile: uploadMedia,

      updateSource: async (id, url) => updateFeaturedImage(id, url),

      deleteRecord: async (id) => prisma.article.delete({ where: { id } }),
    },
    file,
  );
}

/* =========================
   UPDATE
========================= */

export async function updateArticleService(id, data) {
  const existing = await findArticleById(id);

  if (!existing) {
    throw new AppError("Article not found", 404);
  }

  const now = new Date();

  let publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  let status = data.status;

  // ===== STATUS LOGIC =====
  if (status === "PUBLISHED") {
    // jika tanggal kosong → publish sekarang
    if (!publishedAt) {
      publishedAt = now;
    }

    // jika tanggal masa depan → scheduled
    if (publishedAt > now) {
      status = "SCHEDULED";
    }
  }

  return prisma.$transaction(async (tx) => {
    // 1️⃣ update article
    const article = await tx.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: JSON.stringify(data.content),
        excerpt: data.excerpt,
        authorName: data.authorName,
        editorName: data.editorName,
        status,
        publishedAt,
        references: data.references || [],
        featuredImageSource: data.featuredImageSource,
      },
    });

    // 2️⃣ reset categories
    await tx.articleCategory.deleteMany({
      where: { articleId: id },
    });

    if (data.categoryIds?.length) {
      const uniqueCategories = [...new Set(data.categoryIds)];

      await tx.articleCategory.createMany({
        data: uniqueCategories.map((categoryId) => ({
          articleId: id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // 3️⃣ reset tags
    await resetTags(tx, id, data.tagNames || []);

    return article;
  });
}

/* =========================
   DELETE
========================= */

export async function deleteArticleService(id) {
  const existing = await findArticleById(id);
  if (!existing) throw new AppError("Article not found", 404);

  return softDeleteArticle(id);
}

/* =========================
   FORMATTER
========================= */

function formatArticleList(article) {
  return {
    id: article.id,
    title: article.title,
    thumbnail: article.featuredImage,
    status: article.status,
    views: article.views,
    publishedAt: article.publishedAt,
    categories: article.categories.map((c) => c.category),
  };
}

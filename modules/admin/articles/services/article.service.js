import { prisma } from "@/lib/prisma";
import {
  findArticles,
  findById,
  findBySlug,
  softDeleteById,
} from "../repositories/article.repository";
import { createWithUpload } from "@/lib/upload/transactionalUpload";
import Uploads from "@/lib/upload/uploads";

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
    const existing = await findBySlug(slug);
    if (!existing || existing.id === excludeId) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ================= GET LIST =================
export async function getArticles({ status }) {
  const articles = await findArticles({ status });

  return articles.map((a) => ({
    id: a.id,
    title: a.title,
    thumbnail: a.featuredImage,
    status: a.status,
    publishedAt: a.publishedAt,
    categories: a.categories.map((c) => c.category),
  }));
}

// ================= GET DETAIL =================
export async function getArticleById(id) {
  return findById(id);
}

// ================= CREATE =================
export async function createArticleService(data, file) {
  const baseSlug = generateSlug(data.slug || data.title);
  const slug = await generateUniqueSlug(baseSlug);

  const uploads = new Uploads();

  return createWithUpload(
    {
      createRecord: async () => {
        return prisma.$transaction(async (tx) => {
          const article = await tx.article.create({
            data: {
              title: data.title,
              slug,
              content: JSON.stringify(data.content),
              excerpt: data.excerpt || null,
              authorName: data.authorName,
              editorName: data.editorName || null,
              status: data.status,
              publishedAt: data.publishedAt,
              featuredImage: null,

              categories: {
                create: data.categoryIds.map((categoryId) => ({
                  category: { connect: { id: categoryId } },
                })),
              },
            },
          });

          // TAGS
          if (data.tagNames?.length) {
            for (const name of data.tagNames) {
              const tagSlug = generateSlug(name);

              let tag = await tx.tag.findUnique({
                where: { slug: tagSlug },
              });

              if (!tag) {
                tag = await tx.tag.create({
                  data: { name, slug: tagSlug },
                });
              }

              await tx.articleTag.create({
                data: {
                  articleId: article.id,
                  tagId: tag.id,
                },
              });
            }
          }

          return article;
        });
      },

      uploadFile: async (file) => uploads.handleUpload(file),

      updateSource: async (id, url) =>
        prisma.article.update({
          where: { id },
          data: { featuredImage: url },
        }),

      deleteRecord: async (id) =>
        prisma.article.delete({
          where: { id },
        }),
    },
    file
  );
}

// ================= UPDATE =================
export async function updateArticleService(id, data) {
  const existing = await findById(id);
  if (!existing) throw new Error("Artikel tidak ditemukan");

  let slug = existing.slug;

  if (data.slug !== existing.slug) {
    const baseSlug = generateSlug(data.slug || data.title);
    slug = await generateUniqueSlug(baseSlug, id);
  }

  return prisma.$transaction(async (tx) => {
    const article = await tx.article.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: JSON.stringify(data.content),
        excerpt: data.excerpt || null,
        authorName: data.authorName,
        editorName: data.editorName || null,
        status: data.status,
        publishedAt: data.publishedAt,
      },
    });

    // RESET CATEGORY
    await tx.articleCategory.deleteMany({
      where: { articleId: id },
    });

    if (data.categoryIds?.length) {
      await tx.articleCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          articleId: id,
          categoryId,
        })),
      });
    }

    // RESET TAGS
    await tx.articleTag.deleteMany({
      where: { articleId: id },
    });

    if (data.tagNames?.length) {
      for (const name of data.tagNames) {
        const tagSlug = generateSlug(name);

        let tag = await tx.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (!tag) {
          tag = await tx.tag.create({
            data: { name, slug: tagSlug },
          });
        }

        await tx.articleTag.create({
          data: {
            articleId: id,
            tagId: tag.id,
          },
        });
      }
    }

    return article;
  });
}

// ================= DELETE =================
export async function deleteArticleService(id) {
  const existing = await findById(id);
  if (!existing) throw new Error("Artikel tidak ditemukan");

  return softDeleteById(id);
}

import { z } from "zod";

export const articleStatusEnum = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);

export const createArticleSchema = z.object({
  title: z.string().min(3).max(255),

  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  content: z.object({}).passthrough(),

  excerpt: z.string().max(500).optional().nullable(),

  categoryIds: z.array(z.number().int().positive()),

  authorName: z.string().min(2).max(255),
  editorName: z.string().max(255).optional().nullable(),

  status: articleStatusEnum,
  publishedAt: z.coerce.date().optional().nullable(),

  tagNames: z.array(z.string()).optional(),

  references: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),

  featuredImageSource: z.string().optional().nullable(),
});

export function validateArticle(data) {
  return createArticleSchema.parse(data);
}

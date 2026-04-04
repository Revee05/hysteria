import { z } from "zod";

// Max media upload size (bytes)
export const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // Increase to 10 MB for video
export const MAX_MEDIA_SIZE_MB = 5;

/**
 * Common schema for title and description
 */
const heroFields = {
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(500, "Title must not exceed 500 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  isActive: z.boolean().default(false),
};

/**
 * Base HERO schema (shared fields)
 */
export const heroBaseSchema = z.object(heroFields);

/**
 * Schema for creating a hero (requires title, description, isActive)
 * Note: media validation is handled separately by the file upload logic
 * but can be included here for multipart field validation.
 */
export const createHeroSchema = z.object({
  ...heroFields,
  // We don't require media in this schema because it's validated as a File object separately
  // but if the service validates the metadata first, this is the base.
  source: z.string().optional(), // Internal path
});

/**
 * Schema for updating a hero
 */
export const updateHeroSchema = z.object({
  title: heroFields.title.optional(),
  description: heroFields.description.optional(),
  isActive: z.boolean().optional(),
  source: z.string().optional(),
});

/**
 * Schema for query parameters
 */
export const heroQuerySchema = z
  .object({
    perPage: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100)),
    cursor: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(z.number().int().positive().optional()),
    isActive: z
      .string()
      .optional()
      .transform((val) =>
        val === "true" ? true : val === "false" ? false : undefined,
      )
      .pipe(z.boolean().optional()),
  })
  .transform((data) => {
    const result = {};
    if (data.perPage !== undefined) result.perPage = data.perPage;
    if (data.cursor !== undefined) result.cursor = data.cursor;
    if (data.isActive !== undefined) result.isActive = data.isActive;
    return result;
  });

/**
 * Helper function to validate hero data
 */
export function validateHeroData(data, schema) {
  return schema.parse(data);
}

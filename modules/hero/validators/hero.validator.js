import { z } from 'zod';

/**
 * Validate URL format and check if it's a valid media URL
 */
const mediaUrlSchema = z
  .string()
  .refine(
    (url) => {
      if (!url || typeof url !== 'string') return false;

      // Allow local paths starting with '/'
      if (url.startsWith('/')) {
        // must look like a media file path
        return /\.(mp4|webm|ogg|jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
      }

      // For remote URLs, ensure it's a valid absolute URL
      try {
        // eslint-disable-next-line no-new
        new URL(url);
      } catch (e) {
        return false;
      }

      // Check if it's a direct media file or a valid image CDN URL
      const isDirectFile = /\.(mp4|webm|ogg|jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
      const isImageCDN = /^https:\/\/(images\.pexels\.com|images\.unsplash\.com|.*cloudinary\.com|.*imgur\.com)/i.test(url);

      return isDirectFile || isImageCDN;
    },
    {
      message:
        'URL must be a direct media file (.mp4, .jpg, etc.) or from a supported CDN. Pexels page URLs are not allowed.',
    }
  )
  .refine(
    (url) => {
      // Explicitly reject Pexels/Unsplash page URLs
      const isPexelsPage = /pexels\.com\/(video|photo)\/[^/]+-\d+\/?$/.test(url);
      const isUnsplashPage = /unsplash\.com\/photos\//.test(url);
      return !isPexelsPage && !isUnsplashPage;
    },
    {
      message:
        'Please use direct media URLs, not page URLs. For Pexels images, use: https://images.pexels.com/photos/ID/...',
    }
  );

/**
 * Schema for creating a new hero section
 */
export const createHeroSchema = z.object({
  source: mediaUrlSchema,
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(500, 'Title must not exceed 500 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  isActive: z.boolean().default(false),
});

/**
 * Schema for updating an existing hero section
 */
export const updateHeroSchema = z.object({
  source: mediaUrlSchema.optional(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(500, 'Title must not exceed 500 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for query parameters
 */
export const heroQuerySchema = z.object({
  perPage: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
  cursor: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .pipe(z.number().int().positive().optional()),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .pipe(z.boolean().optional()),
}).transform((data) => {
  // Remove undefined values
  const result = {};
  if (data.perPage !== undefined) result.perPage = data.perPage;
  if (data.cursor !== undefined) result.cursor = data.cursor;
  if (data.isActive !== undefined) result.isActive = data.isActive;
  return result;
});

/**
 * Helper function to validate hero data
 * @param {Object} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to use
 * @returns {Object} - Validated data
 * @throws {z.ZodError} - If validation fails
 */
export function validateHeroData(data, schema) {
  return schema.parse(data);
}

import { z } from 'zod';

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0, 'Order must be a positive integer')
    .optional()
    .default(0),
  isActive: z
    .boolean()
    .optional()
    .default(true),
  requiredPermissionId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug cannot be empty')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0, 'Order must be a positive integer')
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  requiredPermissionId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});

/**
 * Validate category data against a schema
 * @param {Object} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to use
 * @returns {Object} Validated data
 * @throws {z.ZodError} If validation fails
 */
export function validateCategoryData(data, schema) {
  return schema.parse(data);
}

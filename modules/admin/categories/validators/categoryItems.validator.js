import { z } from 'zod';

/**
 * Schema for creating a new category item
 */
export const createCategoryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must not exceed 500 characters'),
  slug: z
    .string()
    .max(500, 'Slug must not exceed 500 characters')
    .optional()
    .nullable(),
  url: z
    .string()
    .max(2000, 'URL must not exceed 2000 characters')
    .optional()
    .nullable(),
  parentId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0, 'Order must be a positive integer')
    .optional()
    .default(0),
  meta: z
    .any()
    .optional()
    .nullable(),
  isActive: z
    .boolean()
    .optional()
    .default(true)
});

/**
 * Schema for updating an existing category item
 */
export const updateCategoryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(500, 'Title must not exceed 500 characters')
    .optional(),
  slug: z
    .string()
    .max(500, 'Slug must not exceed 500 characters')
    .optional()
    .nullable(),
  url: z
    .string()
    .max(2000, 'URL must not exceed 2000 characters')
    .optional()
    .nullable(),
  parentId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0, 'Order must be a positive integer')
    .optional(),
  meta: z
    .any()
    .optional()
    .nullable(),
  isActive: z
    .boolean()
    .optional()
});

/**
 * Schema for bulk reordering items
 */
export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      order: z.number().int().min(0)
    })
  ).min(1, 'At least one item is required')
});

/**
 * Validate category item data against a schema
 * @param {Object} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to use
 * @returns {Object} Validated data
 * @throws {z.ZodError} If validation fails
 */
export function validateCategoryItemData(data, schema) {
  return schema.parse(data);
}

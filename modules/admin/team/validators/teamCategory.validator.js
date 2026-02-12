import { z } from "zod";

const booleanSchema = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

const optionalText = (max, message) => z.preprocess((val) => (val === "" ? undefined : val), z.string().max(max, message).optional().nullable());

/**
 * Schema for creating a team category
 */
export const createTeamCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must not exceed 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must not exceed 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens only"),
  description: optionalText(1000, "Description must not exceed 1000 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional(),
  isActive: booleanSchema.optional().default(true),
});

/**
 * Schema for updating a team category
 */
export const updateTeamCategorySchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(200, "Name must not exceed 200 characters").optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .max(200, "Slug must not exceed 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens only")
    .optional(),
  description: optionalText(1000, "Description must not exceed 1000 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional(),
  isActive: booleanSchema.optional(),
});

export function validateTeamCategoryData(data, schema) {
  return schema.parse(data);
}

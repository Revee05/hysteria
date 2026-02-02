import { z } from "zod";

const booleanSchema = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

const optionalText = (max, message) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === "null") return undefined;
    return val;
  }, z.string().max(max, message).optional().nullable());

const optionalEmail = () =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === "null") return undefined;
      return val;
    },
    z.email({ error: "Email must be valid" }).max(255, "Email must not exceed 255 characters").optional(),
  );

/**
 * Schema for creating a team member
 */
export const createTeamMemberSchema = z.object({
  categoryId: z.coerce.number().int().positive("Category is required"),
  name: z.string().min(1, "Name is required").max(200, "Name must not exceed 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must not exceed 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens only"),
  role: z.string().min(1, "Role is required").max(200, "Role must not exceed 200 characters"),
  imageUrl: optionalText(500, "Image URL must not exceed 500 characters"),
  email: optionalEmail(),
  instagram: optionalText(255, "Instagram must not exceed 255 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional().default(0),
  isActive: booleanSchema.optional().default(true),
});

/**
 * Schema for updating a team member
 */
export const updateTeamMemberSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  name: z.string().min(1, "Name cannot be empty").max(200, "Name must not exceed 200 characters").optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .max(200, "Slug must not exceed 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens only")
    .optional(),
  role: z.string().min(1, "Role cannot be empty").max(200, "Role must not exceed 200 characters").optional(),
  imageUrl: optionalText(500, "Image URL must not exceed 500 characters"),
  email: optionalEmail(),
  instagram: optionalText(255, "Instagram must not exceed 255 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional(),
  isActive: booleanSchema.optional(),
});

export function validateTeamMemberData(data, schema) {
  return schema.parse(data);
}

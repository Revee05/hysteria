import logger from "@/lib/logger";
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

// Max media upload size (bytes)
export const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_MEDIA_SIZE_MB = 5;

// Schema to validate uploaded media files (may be an object from multipart parser or an array/FileList)
const mediaFileSchema = z
  .any()
  .optional()
  .refine(
    (file) => {
      logger.info("Validating media file upload", file);
      if (file === undefined || file === null) {
        logger.info("File is undefined or null, skipping size validation");
        return true;
      }
      const f = Array.isArray(file) ? file[0] : file;
      // If it's a string (path) we cannot validate size here, allow it
      if (typeof f === "string") {
        logger.info("File is a string path, skipping size validation");
        return true;
      }
      if (!f || typeof f !== "object") {
        logger.info("File is not an object, failing size validation");
        return false;
      }
      if (typeof f.size === "number") {
        logger.info(`Validating file size: ${f.size} bytes`);
        return f.size <= MAX_MEDIA_SIZE;
      }
      // If no size property, allow (some adapters might not provide it)
      logger.info("File has no size property, skipping size validation");
      return true;
    },
    {
      message: `Maks ${MAX_MEDIA_SIZE_MB} MB`,
    },
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
  imageUrl: mediaFileSchema,
  email: optionalEmail(),
  instagram: optionalText(255, "Instagram must not exceed 255 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional(),
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
  imageUrl: mediaFileSchema,
  email: optionalEmail(),
  instagram: optionalText(255, "Instagram must not exceed 255 characters"),
  order: z.coerce.number().int().min(0, "Order must be a positive integer").optional(),
  isActive: booleanSchema.optional(),
});

export function validateTeamMemberData(data, schema) {
  return schema.parse(data);
}

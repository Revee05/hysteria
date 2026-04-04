import { z } from "zod";

const slugSchema = z
  .string()
  .min(1, "Page slug is required")
  .max(100, "Page slug must not exceed 100 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Page slug must be lowercase alphanumeric with hyphens only");

const optionalText = (max, message) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === "null") return undefined;
    return val;
  }, z.string().max(max, message).optional().nullable());

const imageUrlSchema = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === "null") return null;
    return val;
  },
  z
    .string()
    .max(500, "Image URL must not exceed 500 characters")
    .refine(
      (url) => {
        if (!url || typeof url !== "string") return false;
        if (url.startsWith("/")) {
          return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
        }
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "Image URL must be a valid local path or HTTP(S) URL" },
    )
    .nullable(),
);

export const pageHeroSlugSchema = z.object({
  pageSlug: slugSchema,
});

export const upsertPageHeroSchema = z.object({
  pageSlug: slugSchema,
  imageUrl: imageUrlSchema.optional(),
  title: optionalText(500, "Title must not exceed 500 characters"),
  subtitle: optionalText(2000, "Subtitle must not exceed 2000 characters"),
});

export function validatePageHeroData(data, schema) {
  return schema.parse(data);
}

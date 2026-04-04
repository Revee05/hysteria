import { z } from "zod";

const normalizeOptionalString = (val) => {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length ? str : undefined;
};

const imageUrlSchema = z
  .string()
  .max(500, "Image URL terlalu panjang")
  .refine(
    (url) => {
      if (!url) return false;
      if (url.startsWith("/")) return true;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Image URL harus path lokal atau URL http(s) valid" },
  );

export const createSejarahSchema = z.object({
  title: z.preprocess(normalizeOptionalString, z.string().min(2, "Title minimal 2 karakter").max(255, "Title terlalu panjang")),
  imageUrl: z.preprocess(normalizeOptionalString, imageUrlSchema.optional()),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateSejarahSchema = z.object({
  title: z.preprocess(normalizeOptionalString, z.string().min(2, "Title minimal 2 karakter").max(255, "Title terlalu panjang").optional()),
  imageUrl: z.preprocess((v) => (v === "" || v === null ? null : normalizeOptionalString(v)), imageUrlSchema.nullable().optional()),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
});

export function validateCreateSejarahData(data) {
  return createSejarahSchema.parse(data);
}

export function validateUpdateSejarahData(data) {
  return updateSejarahSchema.parse(data);
}

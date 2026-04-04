import { z } from "zod";

const normalizeOptionalString = (val) => {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length ? str : undefined;
};

const linkSchema = z
  .string()
  .max(500, "Link terlalu panjang")
  .refine(
    (url) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Link harus URL http(s) valid" },
  );

export const createPanduanVisualSchema = z.object({
  title: z.preprocess(normalizeOptionalString, z.string().min(2, "Title minimal 2 karakter").max(255, "Title terlalu panjang")),
  link: z.preprocess(normalizeOptionalString, linkSchema.optional()),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updatePanduanVisualSchema = z.object({
  title: z.preprocess(normalizeOptionalString, z.string().min(2, "Title minimal 2 karakter").max(255, "Title terlalu panjang").optional()),
  link: z.preprocess((v) => (v === "" || v === null ? null : normalizeOptionalString(v)), linkSchema.nullable().optional()),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
});

export function validateCreatePanduanVisualData(data) {
  return createPanduanVisualSchema.parse(data);
}

export function validateUpdatePanduanVisualData(data) {
  return updatePanduanVisualSchema.parse(data);
}

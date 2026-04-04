import { z } from "zod";

const optionalUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === "string" ? v.trim() : ""))
  .transform((v) => (v === "" ? null : v))
  .refine((v) => {
    if (v === null) return true;
    if (v.startsWith("/")) return true;
    try {
      const parsed = new URL(v);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "URL tidak valid. Gunakan http(s):// atau path lokal")
  .refine((v) => v === null || v.length <= 500, "Maksimal 500 karakter");

const slotTypeSchema = z.enum(["tall", "short"]).or(z.enum(["TALL", "SHORT"]).transform((value) => value.toLowerCase()));

export const homepagePlatformCardSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(255, "Maksimal 255 karakter"),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  slotType: slotTypeSchema,
  order: z.coerce.number().int().min(0).max(1000),
  isActive: z.boolean().default(true),
});

export const upsertHomepagePlatformCardsSchema = z.object({
  cards: z.array(homepagePlatformCardSchema).length(5, "Harus tepat 5 kartu"),
});

export function validateHomepagePlatformPayload(payload) {
  return upsertHomepagePlatformCardsSchema.parse(payload);
}

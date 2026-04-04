import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(2000, "Nilai terlalu panjang")
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  });

const optionalShortText = z
  .string()
  .trim()
  .max(255, "Nilai terlalu panjang")
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  });

const optionalBooleanLike = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => value === true || value === "true");

export const upsertWebsiteInfoSchema = z.object({
  judul: optionalShortText,
  deskripsi: optionalText,
  deskripsiFooter: optionalText,
  logoWebsite: optionalText,
  faviconWebsite: optionalText,
  clearLogoWebsite: optionalBooleanLike,
  clearFaviconWebsite: optionalBooleanLike,
});

export function validateWebsiteInfoData(data) {
  return upsertWebsiteInfoSchema.parse(data || {});
}

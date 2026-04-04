import { z } from "zod";

const normalizeOptionalString = (val) => {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length ? str : undefined;
};

export const upsertTentangVisiMisiSchema = z.object({
  description: z.preprocess(normalizeOptionalString, z.string().min(3, "Deskripsi minimal 3 karakter").max(12000, "Deskripsi terlalu panjang")),
  visi: z.preprocess(normalizeOptionalString, z.string().min(3, "Visi minimal 3 karakter").max(5000, "Visi terlalu panjang")),
  misi: z.preprocess(normalizeOptionalString, z.string().min(3, "Misi minimal 3 karakter").max(12000, "Misi terlalu panjang")),
});

export function validateTentangVisiMisiData(data) {
  return upsertTentangVisiMisiSchema.parse(data);
}

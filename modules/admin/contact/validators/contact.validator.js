import { z } from "zod";

const optionalUrl = z.string().trim().url("URL tidak valid").or(z.literal("")).optional();

export const contactSectionSchema = z.object({
  mapsEmbedUrl: z.string().trim().min(1, "Maps embed URL wajib diisi"),
  locationTitle: z.string().trim().min(1, "Judul lokasi wajib diisi").max(255),
  locationAddress: z.string().trim().min(1, "Alamat wajib diisi"),
  operationalHours: z.string().trim().min(1, "Jam operasional wajib diisi"),
  whatsappNumber: z.string().trim().min(6, "Nomor WhatsApp tidak valid").max(30),
  instagramUrl: optionalUrl,
  twitterUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  email: z.string().trim().email("Email tidak valid").or(z.literal("")).optional(),
});

export function validateContactSectionData(data) {
  return contactSectionSchema.parse(data);
}

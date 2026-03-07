import { z } from "zod";

const isUrlOrEmail = (value) => {
  const urlCheck = z.string().url().safeParse(value).success;
  const emailCheck = z.string().email().safeParse(value).success;
  return urlCheck || emailCheck;
};

const displayItemSchema = z.object({
  title: z.string().trim().min(1, "Title wajib diisi"),
  subTitle: z.string().trim().optional().default(""),
  imageUrl: z.string().trim().optional().default(""),
});

export const collaborationContentSchema = z.object({
  googleFormUrl: z
    .string()
    .trim()
    .refine(isUrlOrEmail, "Link kolaborasi harus berupa URL atau email yang valid"),
  whatsappNumber: z.string().trim().min(6, "Nomor WhatsApp tidak valid").max(30),
  whatsappMessage: z.string().trim().min(1, "Pesan WhatsApp wajib diisi").max(500),
  heroSubHeadline: z.string().trim().optional().default(""),
  heroNotes: z.string().trim().optional().default(""),
  whyBenefits: z.array(displayItemSchema).optional().default([]),
  schemes: z.array(displayItemSchema).optional().default([]),
  flowSteps: z.array(displayItemSchema).optional().default([]),
});

export function validateCollaborationContentData(data) {
  return collaborationContentSchema.parse(data || {});
}

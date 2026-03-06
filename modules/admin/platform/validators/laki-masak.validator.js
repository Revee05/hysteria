import { z } from 'zod';

// ── WhatsApp send URL ─────────────────────────────────────────────────────────
// Accepts: https://api.whatsapp.com/send/?phone=62...
const whatsappUrlSchema = z.string().refine((val) => {
  try {
    const u = new URL(val);
    if (u.hostname !== 'api.whatsapp.com') return false;
    if (!u.searchParams.has('phone')) return false;
    const phone = u.searchParams.get('phone') || '';
    // digits only, reasonable length 6-15
    return /^\d{6,15}$/.test(phone);
  } catch {
    return false;
  }
}, { message: 'Invalid WhatsApp URL. Expected https://api.whatsapp.com/send/?phone=<country+number>' });

// ── Shared optional fields ───────────────────────────────────────────────────
const commonFields = {
  parentId: z.number().int().nullable().optional(),
  order: z.number().int().optional(),
  meta: z.any().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().optional(),
};

// ── Pre-Order schema ─────────────────────────────────────────────────────────
export const updatePreOrderSchema = z.object({
  url: whatsappUrlSchema.optional(),
  ...commonFields,
});

// ── Generic validate helper ──────────────────────────────────────────────────
export function validateLakiMasakData(data, schema) {
  return schema.parse(data);
}

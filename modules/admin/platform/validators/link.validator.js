import { z } from 'zod';

// Validate a WhatsApp send URL with phone param: https://api.whatsapp.com/send/?phone=62...
const whatsappUrlSchema = z.string().refine((val) => {
  try {
    const u = new URL(val);
    if (u.hostname !== 'api.whatsapp.com') return false;
    if (!u.searchParams.has('phone')) return false;
    const phone = u.searchParams.get('phone') || '';
    // must be digits only, reasonable length 6-15
    return /^\d{6,15}$/.test(phone);
  } catch {
    return false;
  }
}, { message: 'Invalid WhatsApp URL. Expected https://api.whatsapp.com/send/?phone=<country+number>' });

const optionalText = (max, message) =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === 'null') return undefined;
    return val;
  }, z.string().max(max, message).optional().nullable());

export const updateMerchandiseSchema = z.object({
  url: whatsappUrlSchema.optional(),
  parentId: z.number().int().nullable().optional(),
  order: z.number().int().optional(),
  meta: z.any().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().optional()
});

export function validateMerchandiseData(data, schema) {
  return schema.parse(data);
}

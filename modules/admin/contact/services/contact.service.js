import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import {
  createContactSection,
  findActiveContactSection,
  findLatestContactSection,
  updateContactSectionById,
} from "../repositories/contact.repository.js";
import { validateContactSectionData } from "../validators/contact.validator.js";

const FALLBACK_CONTACT = {
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126559.80427893577!2d110.32047802407377!3d-6.993126356472846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4ec52229d7%3A0xc791d6abc9236c7!2sSemarang%2C%20Kota%20Semarang%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1738157000000!5m2!1sid!2sid",
  locationTitle: "Gerobak Artkos x Hysteria",
  locationAddress: "Jl. Stonen No.29, Bendan Ngisor, Kec. Gajahmungkur,\nKota Semarang, Jawa Tengah 50233",
  operationalHours: "Senin - Jumat: 09:00 - 17:00 WIB\nSabtu: 10:00 - 15:00 WIB\nMinggu & Libur: Tutup",
  whatsappNumber: "628121272483",
  instagramUrl: "https://instagram.com/grobakhysteria",
  twitterUrl: "https://twitter.com/grobakhysteria",
  facebookUrl: "https://facebook.com/kolektifhysteria",
  youtubeUrl: "https://youtube.com/@kolektifhysteria",
  tiktokUrl: "",
  email: "hysteriakita59@gmail.com",
};

export async function getPublicContactSection() {
  try {
    const row = await findActiveContactSection();
    return row || FALLBACK_CONTACT;
  } catch (error) {
    logger.error("Failed to fetch public contact section", { error: error?.message || error });
    return FALLBACK_CONTACT;
  }
}

export async function getAdminContactSection() {
  const row = await findLatestContactSection();
  return row || FALLBACK_CONTACT;
}

export async function upsertAdminContactSection(data) {
  let validated;
  try {
    validated = validateContactSectionData(data || {});
  } catch (error) {
    logger.warn("Contact section validation failed", { error: error?.issues || error?.errors || error });
    throw new AppError(error?.issues?.[0]?.message || "Invalid contact data", 400, "VALIDATION_ERROR");
  }

  try {
    const existing = await findLatestContactSection();
    if (existing?.id) {
      return await updateContactSectionById(existing.id, validated);
    }

    return await createContactSection(validated);
  } catch (error) {
    logger.error("Failed to upsert contact section", { error: error?.message || error });
    throw new AppError("Failed to save contact section", 500, "CONTACT_SAVE_FAILED");
  }
}

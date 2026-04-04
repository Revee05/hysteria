import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import * as visiMisiRepository from "../repositories/visiMisi.repository.js";
import { validateTentangVisiMisiData } from "../validators/visiMisi.validator.js";

const PAGE_SLUG = "tentang";

export async function getTentangVisiMisi() {
  return visiMisiRepository.findTentangVisiMisiBySlug(PAGE_SLUG);
}

export async function upsertTentangVisiMisi(data) {
  let validated;
  try {
    validated = validateTentangVisiMisiData(data);
  } catch (error) {
    logger.warn("Tentang visi misi validation failed", { error: error?.errors || error?.issues });
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid visi misi data", 400, "VALIDATION_ERROR");
  }

  try {
    return await visiMisiRepository.upsertTentangVisiMisiBySlug(PAGE_SLUG, validated);
  } catch (error) {
    logger.error("Failed to upsert visi misi", { error: error?.message || error });
    throw new AppError("Failed to save visi misi", 500);
  }
}

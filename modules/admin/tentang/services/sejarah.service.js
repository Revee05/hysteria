import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import Uploads from "../../../../lib/upload/uploads.js";
import { createWithUpload, updateWithUpload } from "../../../../lib/upload/transactionalUpload.js";
import * as sejarahRepository from "../repositories/sejarah.repository.js";
import { validateCreateSejarahData, validateUpdateSejarahData } from "../validators/sejarah.validator.js";

const isManagedUpload = (source) => {
  if (!source || typeof source !== "string") return false;
  const normalized = source.replace(/\\/g, "/");
  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/") || normalized.includes("/uploads/")) return true;
  if (process.env.S3_PUBLIC_URL) {
    const publicUrl = process.env.S3_PUBLIC_URL.replace(/\/$/, "");
    if (normalized.startsWith(publicUrl)) return true;
  }
  if (/s3\.amazonaws\.com/.test(normalized) || /s3[.-]/.test(normalized)) return true;
  return false;
};

export async function getSejarahItems(options = {}) {
  return sejarahRepository.findSejarahItems(options);
}

export async function getSejarahItemById(id) {
  const item = await sejarahRepository.findSejarahItemById(id);
  if (!item) throw new AppError("Sejarah item not found", 404);
  return item;
}

export async function createSejarahItem(data) {
  let payload;
  try {
    payload = validateCreateSejarahData(data);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid sejarah data", 400, "VALIDATION_ERROR");
  }

  if (payload.order === undefined || payload.order === null) {
    const maxOrder = await sejarahRepository.findMaxSejarahOrder();
    payload.order = maxOrder + 1;
  }

  return sejarahRepository.createSejarahItem(payload);
}

export async function createSejarahItemWithFile(data, file) {
  const payload = { ...data };
  delete payload.imageUrl;

  let validated;
  try {
    validated = validateCreateSejarahData(payload);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid sejarah data", 400, "VALIDATION_ERROR");
  }

  if (validated.order === undefined || validated.order === null) {
    const maxOrder = await sejarahRepository.findMaxSejarahOrder();
    validated.order = maxOrder + 1;
  }

  const uploads = new Uploads();
  return createWithUpload(
    {
      createRecord: async () => sejarahRepository.createSejarahItem(validated),
      uploadFile: async (filePayload) => uploads.handleUpload(filePayload),
      updateSource: async (recordId, url) => sejarahRepository.updateSejarahItem(recordId, { imageUrl: url }),
      deleteRecord: async (recordId) => sejarahRepository.deleteSejarahItem(recordId),
    },
    file,
  );
}

export async function updateSejarahItem(id, data) {
  const existing = await getSejarahItemById(id);

  let validated;
  try {
    validated = validateUpdateSejarahData(data);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid sejarah data", 400, "VALIDATION_ERROR");
  }

  const payload = Object.fromEntries(Object.entries(validated).filter(([, value]) => value !== undefined));
  if (Object.keys(payload).length === 0) throw new AppError("No valid fields to update", 400);

  if (Object.prototype.hasOwnProperty.call(payload, "imageUrl") && (payload.imageUrl === "" || payload.imageUrl === null)) {
    payload.imageUrl = null;
    if (existing.imageUrl && isManagedUpload(existing.imageUrl)) {
      const uploads = new Uploads();
      try {
        await uploads.deleteFile(existing.imageUrl);
      } catch (error) {
        logger.warn("Failed deleting previous sejarah image", { id, error: error?.message || error });
      }
    }
  }

  return sejarahRepository.updateSejarahItem(id, payload);
}

export async function updateSejarahItemWithFile(id, data, file) {
  const existing = await getSejarahItemById(id);

  let validated;
  try {
    validated = validateUpdateSejarahData(data);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid sejarah data", 400, "VALIDATION_ERROR");
  }

  const payload = Object.fromEntries(Object.entries(validated).filter(([, value]) => value !== undefined));
  delete payload.imageUrl;

  const uploads = new Uploads();
  const snapshot = { ...existing, source: existing.imageUrl };

  return updateWithUpload(
    {
      getExisting: async () => snapshot,
      updateRecord: async (recordId, dataToUpdate) => sejarahRepository.updateSejarahItem(recordId, dataToUpdate),
      uploadFile: async (filePayload) => uploads.handleUpload(filePayload),
      updateSource: async (recordId, url) => sejarahRepository.updateSejarahItem(recordId, { imageUrl: url }),
      revertRecord: async (recordId, prev) =>
        sejarahRepository.updateSejarahItem(recordId, {
          title: prev.title,
          imageUrl: prev.imageUrl,
          order: prev.order,
          isActive: prev.isActive,
        }),
      deleteFile: async (oldSource) => {
        if (!isManagedUpload(oldSource)) return;
        await uploads.deleteFile(oldSource);
      },
    },
    id,
    payload,
    file,
  );
}

export async function deleteSejarahItem(id) {
  const existing = await getSejarahItemById(id);
  await sejarahRepository.deleteSejarahItem(id);

  if (existing.imageUrl && isManagedUpload(existing.imageUrl)) {
    const uploads = new Uploads();
    try {
      await uploads.deleteFile(existing.imageUrl);
    } catch (error) {
      logger.warn("Failed deleting sejarah image on delete", { id, error: error?.message || error });
    }
  }

  return { message: "Sejarah item deleted successfully" };
}

export async function reorderSejarahItems(items = []) {
  if (!Array.isArray(items)) throw new AppError("Invalid reorder payload", 400);

  const normalized = items.map((item) => {
    const id = Number(item.id);
    const order = Number(item.order);
    if (!Number.isFinite(id) || id <= 0) throw new AppError("Invalid sejarah item id", 400);
    if (!Number.isFinite(order) || order < 0) throw new AppError("Invalid sejarah item order", 400);
    return { id, order };
  });

  await sejarahRepository.updateSejarahOrders(normalized);
  return { count: normalized.length };
}

import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import Uploads from "../../../../lib/upload/uploads.js";
import * as pageHeroRepository from "../repositories/pageHero.repository.js";
import { pageHeroSlugSchema, upsertPageHeroSchema, validatePageHeroData } from "../validators/pageHero.validator.js";

const normalizeSlug = (slug) =>
  String(slug || "")
    .trim()
    .toLowerCase();

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

export async function getPageHeroBySlug(pageSlug) {
  const normalizedSlug = normalizeSlug(pageSlug);
  logger.info("[PageHero][Service][GET] Start", { pageSlug: normalizedSlug });

  let validated;
  try {
    validated = validatePageHeroData({ pageSlug: normalizedSlug }, pageHeroSlugSchema);
  } catch (error) {
    logger.warn("[PageHero][Service][GET] Validation failed", {
      pageSlug: normalizedSlug,
      error: error?.errors,
    });
    throw new AppError(error?.errors?.[0]?.message || "Invalid page slug", 400, "VALIDATION_ERROR");
  }

  const hero = await pageHeroRepository.findPageHeroBySlug(validated.pageSlug);
  logger.info("[PageHero][Service][GET] Success", { pageSlug: validated.pageSlug, found: !!hero });
  return hero;
}

export async function upsertPageHeroBySlug(pageSlug, data = {}) {
  const normalizedSlug = normalizeSlug(pageSlug);
  const shouldClearImage = data?.clearImage === true || data?.clearImage === "true";
  const normalizedData = {
    ...data,
    ...(shouldClearImage ? { imageUrl: null } : {}),
  };
  delete normalizedData.clearImage;

  const hasImageUrlField = Object.prototype.hasOwnProperty.call(normalizedData || {}, "imageUrl");
  logger.info("[PageHero][Service][UPSERT] upsertPageHeroBySlug Start", {
    pageSlug: normalizedSlug,
    hasImageUrl: !!normalizedData?.imageUrl,
    hasImageUrlField,
    shouldClearImage,
    hasTitle: normalizedData?.title !== undefined,
    hasSubtitle: normalizedData?.subtitle !== undefined,
  });

  let validated;
  try {
    validated = validatePageHeroData({ ...normalizedData, pageSlug: normalizedSlug }, upsertPageHeroSchema);
  } catch (error) {
    logger.warn("Page hero validation failed", { pageSlug: normalizedSlug, error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Invalid page hero data", 400, "VALIDATION_ERROR");
  }

  const existing = await pageHeroRepository.findPageHeroBySlug(validated.pageSlug);
  logger.info("[PageHero][Service][UPSERT] Existing lookup", {
    pageSlug: validated.pageSlug,
    exists: !!existing,
  });

  const payload = Object.fromEntries(Object.entries(validated).filter(([key, value]) => key !== "pageSlug" && value !== undefined));

  logger.info("[PageHero][Service][UPSERT] Persisting", {
    pageSlug: validated.pageSlug,
    payloadKeys: Object.keys(payload || {}),
  });
  const hero = await pageHeroRepository.upsertPageHeroBySlug(validated.pageSlug, payload);
  logger.info("[PageHero][Service][UPSERT] Persisted", {
    pageSlug: validated.pageSlug,
    heroId: hero?.id,
    hasImage: !!hero?.imageUrl,
  });

  const imageUrlIncluded = Object.prototype.hasOwnProperty.call(payload, "imageUrl");

  if (imageUrlIncluded && existing?.imageUrl && existing.imageUrl !== payload.imageUrl && isManagedUpload(existing.imageUrl)) {
    const uploads = new Uploads();
    try {
      await uploads.deleteFile(existing.imageUrl);
    } catch (error) {
      logger.warn("Failed to delete previous page hero image", {
        pageSlug: validated.pageSlug,
        oldImage: existing.imageUrl,
        error: error?.message,
      });
    }
  }

  return hero;
}

export async function upsertPageHeroWithFile(pageSlug, data = {}, file) {
  const normalizedSlug = normalizeSlug(pageSlug);
  logger.info("[PageHero][Service][UPLOAD] upsertPageHeroWithFile Start", {
    pageSlug: normalizedSlug,
    fileName: file?.originalname || file?.filename || null,
    fileType: file?.mimetype || null,
    fileSize: file?.size || null,
  });

  let validated;
  try {
    validated = validatePageHeroData({ ...data, pageSlug: normalizedSlug }, upsertPageHeroSchema.omit({ imageUrl: true }));
  } catch (error) {
    logger.warn("Page hero upload validation failed", { pageSlug: normalizedSlug, error: error?.errors });
    throw new AppError(error?.errors?.[0]?.message || "Invalid page hero data", 400, "VALIDATION_ERROR");
  }

  const existing = await pageHeroRepository.findPageHeroBySlug(validated.pageSlug);
  logger.info("[PageHero][Service][UPLOAD] Existing lookup", {
    pageSlug: validated.pageSlug,
    exists: !!existing,
  });

  const uploads = new Uploads();
  let uploadedUrl = null;

  try {
    logger.info("[PageHero][Service][UPLOAD] Uploading file", { pageSlug: validated.pageSlug });
    const uploadResult = await uploads.handleUpload(file);
    uploadedUrl = uploadResult?.url;

    if (!uploadedUrl) {
      throw new AppError("Failed to upload image", 500);
    }

    logger.info("[PageHero][Service][UPLOAD] Upload success", {
      pageSlug: validated.pageSlug,
      uploadedUrl,
    });

    const payload = {
      imageUrl: uploadedUrl,
      ...(validated.title !== undefined ? { title: validated.title } : {}),
      ...(validated.subtitle !== undefined ? { subtitle: validated.subtitle } : {}),
    };

    const hero = await pageHeroRepository.upsertPageHeroBySlug(validated.pageSlug, payload);
    logger.info("[PageHero][Service][UPLOAD] Persisted", {
      pageSlug: validated.pageSlug,
      heroId: hero?.id,
      hasImage: !!hero?.imageUrl,
    });

    if (existing?.imageUrl && existing.imageUrl !== uploadedUrl && isManagedUpload(existing.imageUrl)) {
      try {
        await uploads.deleteFile(existing.imageUrl);
      } catch (error) {
        logger.warn("Failed to delete previous page hero image after upload", {
          pageSlug: validated.pageSlug,
          oldImage: existing.imageUrl,
          error: error?.message,
        });
      }
    }

    return hero;
  } catch (error) {
    logger.error("[PageHero][Service][UPLOAD] Failed", {
      pageSlug: normalizedSlug,
      error: error?.message || error,
    });
    if (uploadedUrl) {
      try {
        await uploads.deleteFile(uploadedUrl);
      } catch (cleanupError) {
        logger.warn("Failed to cleanup uploaded page hero image after error", {
          pageSlug: normalizedSlug,
          uploadedUrl,
          error: cleanupError?.message,
        });
      }
    }
    if (error instanceof AppError) throw error;
    throw new AppError(error?.message || "Failed to save page hero", 500);
  }
}

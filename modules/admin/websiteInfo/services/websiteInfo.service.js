import logger from "../../../../lib/logger.js";
import { AppError } from "../../../../lib/response.js";
import Uploads from "../../../../lib/upload/uploads.js";
import { DEFAULT_WEBSITE_INFO, withWebsiteInfoDefaults } from "../../../../lib/defaults/website-info.js";
import { findWebsiteInfo, upsertWebsiteInfo } from "../repositories/websiteInfo.repository.js";
import { validateWebsiteInfoData } from "../validators/websiteInfo.validator.js";

function isManagedUpload(source) {
  if (!source || typeof source !== "string") return false;

  const normalized = source.replace(/\\/g, "/");
  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/") || normalized.includes("/uploads/")) return true;

  if (process.env.S3_PUBLIC_URL) {
    const publicUrl = process.env.S3_PUBLIC_URL.replace(/\/$/, "");
    if (normalized.startsWith(publicUrl)) return true;
  }

  if (/s3\.amazonaws\.com/.test(normalized) || /s3[.-]/.test(normalized)) return true;
  return false;
}

function buildPayload(existing, validated) {
  const next = {
    judul: existing?.judul ?? null,
    deskripsi: existing?.deskripsi ?? null,
    deskripsiFooter: existing?.deskripsifooter ?? existing?.deskripsiFooter ?? null,
    logoWebsite: existing?.logowebsite ?? existing?.logoWebsite ?? null,
    faviconWebsite: existing?.faviconwebsite ?? existing?.faviconWebsite ?? null,
  };

  if (Object.prototype.hasOwnProperty.call(validated, "judul")) next.judul = validated.judul;
  if (Object.prototype.hasOwnProperty.call(validated, "deskripsi")) next.deskripsi = validated.deskripsi;
  if (Object.prototype.hasOwnProperty.call(validated, "deskripsiFooter")) next.deskripsiFooter = validated.deskripsiFooter;
  if (Object.prototype.hasOwnProperty.call(validated, "logoWebsite")) next.logoWebsite = validated.logoWebsite;
  if (Object.prototype.hasOwnProperty.call(validated, "faviconWebsite")) next.faviconWebsite = validated.faviconWebsite;

  if (validated.clearLogoWebsite) next.logoWebsite = null;
  if (validated.clearFaviconWebsite) next.faviconWebsite = null;

  return next;
}

function normalizeRow(row) {
  if (!row) return null;
  return {
    judul: row.judul ?? null,
    deskripsi: row.deskripsi ?? null,
    deskripsiFooter: row.deskripsifooter ?? row.deskripsiFooter ?? null,
    logoWebsite: row.logowebsite ?? row.logoWebsite ?? null,
    faviconWebsite: row.faviconwebsite ?? row.faviconWebsite ?? null,
  };
}

export async function getPublicWebsiteInfo() {
  try {
    const row = await findWebsiteInfo();
    return withWebsiteInfoDefaults(normalizeRow(row) || DEFAULT_WEBSITE_INFO);
  } catch (error) {
    logger.error("Failed to fetch public website info", { error: error?.message || error });
    return { ...DEFAULT_WEBSITE_INFO };
  }
}

export async function getAdminWebsiteInfo() {
  const row = await findWebsiteInfo();
  return withWebsiteInfoDefaults(normalizeRow(row) || DEFAULT_WEBSITE_INFO);
}

export async function upsertAdminWebsiteInfo(data = {}, files = {}) {
  let validated;
  try {
    validated = validateWebsiteInfoData(data || {});
  } catch (error) {
    logger.warn("Website info validation failed", { error: error?.issues || error?.errors || error });
    throw new AppError(error?.issues?.[0]?.message || "Invalid website info data", 400, "VALIDATION_ERROR");
  }

  const existingRow = await findWebsiteInfo();
  const existing = normalizeRow(existingRow);
  const uploads = new Uploads();

  const payload = buildPayload(existing, validated);
  const uploadedUrls = [];

  try {
    if (files.logoWebsiteFile) {
      const uploadResult = await uploads.handleUpload(files.logoWebsiteFile);
      payload.logoWebsite = uploadResult?.url || null;
      if (uploadResult?.url) uploadedUrls.push(uploadResult.url);
    }

    if (files.faviconWebsiteFile) {
      const uploadResult = await uploads.handleUpload(files.faviconWebsiteFile);
      payload.faviconWebsite = uploadResult?.url || null;
      if (uploadResult?.url) uploadedUrls.push(uploadResult.url);
    }

    const saved = await upsertWebsiteInfo(payload);
    const normalizedSaved = normalizeRow(saved);

    const oldLogo = existing?.logoWebsite;
    const newLogo = normalizedSaved?.logoWebsite;
    if (oldLogo && oldLogo !== newLogo && isManagedUpload(oldLogo)) {
      try {
        await uploads.deleteFile(oldLogo);
      } catch (error) {
        logger.warn("Failed to delete previous website logo", { error: error?.message || error });
      }
    }

    const oldFavicon = existing?.faviconWebsite;
    const newFavicon = normalizedSaved?.faviconWebsite;
    if (oldFavicon && oldFavicon !== newFavicon && isManagedUpload(oldFavicon)) {
      try {
        await uploads.deleteFile(oldFavicon);
      } catch (error) {
        logger.warn("Failed to delete previous website favicon", { error: error?.message || error });
      }
    }

    return withWebsiteInfoDefaults(normalizedSaved || DEFAULT_WEBSITE_INFO);
  } catch (error) {
    for (const url of uploadedUrls) {
      try {
        await uploads.deleteFile(url);
      } catch (cleanupError) {
        logger.warn("Failed to cleanup uploaded website info file", {
          url,
          error: cleanupError?.message || cleanupError,
        });
      }
    }

    if (error instanceof AppError) throw error;
    logger.error("Failed to save website info", { error: error?.message || error });
    throw new AppError("Failed to save website info", 500, "WEBSITE_INFO_SAVE_FAILED");
  }
}

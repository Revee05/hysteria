import { respondSuccess, respondError, AppError } from "../../../../../../../lib/response.js";
import logger from "../../../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../../../lib/helper/permission.helper.js";
import {
  getPlatformImage,
  updatePlatformImage,
  updatePlatformImageWithFile,
} from "../../../../../../../modules/admin/platform/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export async function GET(request, { params }) {
  try {
    const { slug, key } = await params;
    logger.info("[Platform][Admin][IMAGE][GET] Start", { slug, key });

    await requireAuthWithPermission(request, ["platform.read"]);

    const image = await getPlatformImage(slug, key);

    logger.info("[Platform][Admin][IMAGE][GET] Success", { slug, key });
    return respondSuccess(image, 200);
  } catch (error) {
    logger.error("[Platform][Admin][IMAGE][GET] Error", { error: error?.stack || error?.message });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch image", 500));
  }
}

export async function PATCH(request, { params }) {
  try {
    const { slug, key } = await params;
    logger.info("[Platform][Admin][IMAGE][PATCH] Start", { slug, key });

    await requireAuthWithPermission(request, ["platform.update"]);

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });

      const uploadedFile = (files || []).find((f) => f.fieldname === "imageUrl") || null;
      logger.info("[Platform][Admin][IMAGE][PATCH] Parsed multipart", {
        slug,
        key,
        hasFile: !!uploadedFile,
        fieldKeys: Object.keys(fields || {}),
      });

      if (uploadedFile) {
        const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        if (!validateFileMimeType(uploadedFile, allowedTypes)) {
          return respondError(new AppError(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`, 415));
        }
        if (!validateFileSize(uploadedFile, MAX_UPLOAD_SIZE)) {
          return respondError(new AppError(`File too large. Max: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 413));
        }

        const image = await updatePlatformImageWithFile(slug, key, fields || {}, uploadedFile);
        logger.info("[Platform][Admin][IMAGE][PATCH] Success (with file)", { slug, key });
        return respondSuccess(image, 200);
      }

      const image = await updatePlatformImage(slug, key, fields || {});
      logger.info("[Platform][Admin][IMAGE][PATCH] Success (no file)", { slug, key });
      return respondSuccess(image, 200);
    }

    const body = await request.json();
    const image = await updatePlatformImage(slug, key, body || {});
    logger.info("[Platform][Admin][IMAGE][PATCH] Success (json)", { slug, key });
    return respondSuccess(image, 200);
  } catch (error) {
    logger.error("[Platform][Admin][IMAGE][PATCH] Error", { error: error?.stack || error?.message });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to update image", 500));
  }
}

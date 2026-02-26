import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../lib/api-logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getPlatformBySlug, updatePlatformBySlug, updatePlatformWithMainImage } from "../../../../../modules/admin/platform/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const getHandler = async (request, { params }) => {
  try {
    const { slug } = await params;
    logInfo("[Platform][Admin][GET] Start", { slug });

    await requireAuthWithPermission(request, ["platform.read"]);

    const platform = await getPlatformBySlug(slug);

    if (!platform) {
      return respondError(new AppError(`Platform '${slug}' not found`, 404, "NOT_FOUND"));
    }

    logInfo("[Platform][Admin][GET] Success", { slug });
    return respondSuccess(platform, 200);
  } catch (error) {
    logError("[Platform][Admin][GET] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch platform", 500));
  }
}

export const GET = withApiLogging(getHandler, 'api/admin/platform/[slug]')

const patchHandler = async (request, { params }) => {
  try {
    const { slug } = await params;
    logInfo("[Platform][Admin][PATCH] Start", { slug });

    await requireAuthWithPermission(request, ["platform.update"]);

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });

      const uploadedFile = (files || []).find((f) => f.fieldname === "mainImageUrl") || null;
      logInfo("[Platform][Admin][PATCH] Parsed multipart", {
        slug,
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

        const platform = await updatePlatformWithMainImage(slug, fields || {}, uploadedFile);
        logInfo("[Platform][Admin][PATCH] Success (with file)", { slug });
        return respondSuccess(platform, 200);
      }

      const platform = await updatePlatformBySlug(slug, fields || {});
      logInfo("[Platform][Admin][PATCH] Success (no file)", { slug });
      return respondSuccess(platform, 200);
    }

    const body = await request.json();
    const platform = await updatePlatformBySlug(slug, body || {});
    logInfo("[Platform][Admin][PATCH] Success (json)", { slug });
    return respondSuccess(platform, 200);
  } catch (error) {
    logError("[Platform][Admin][PATCH] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to update platform", 500));
  }
}

export const PATCH = withApiLogging(patchHandler, 'api/admin/platform/[slug]')

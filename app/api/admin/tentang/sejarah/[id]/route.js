import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import logger from "../../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import { getSejarahItemById, updateSejarahItem, updateSejarahItemWithFile, deleteSejarahItem } from "../../../../../../modules/admin/tentang/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.read", "team.read"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid sejarah id", 400));

    const item = await getSejarahItemById(entityId);
    return respondSuccess(item, 200);
  } catch (error) {
    logger.error("Error fetching sejarah item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch sejarah item", 500));
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.update", "team.update"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid sejarah id", 400));

    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let uploadedFile = null;

    if (contentType.includes("multipart/form-data")) {
      const result = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });
      body = result.fields || {};
      const files = result.files || [];
      uploadedFile = files.find((file) => file.fieldname === "imageUrl") || null;
      if (body.isActive !== undefined) body.isActive = body.isActive === "true" || body.isActive === true;
    } else {
      body = await request.json();
    }

    if (uploadedFile) {
      const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!validateFileMimeType(uploadedFile, allowedTypes)) {
        return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
      }

      if (!validateFileSize(uploadedFile, MAX_UPLOAD_SIZE)) {
        return respondError(new AppError(`File too large. Maximum size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 413));
      }

      const item = await updateSejarahItemWithFile(entityId, body || {}, uploadedFile);
      return respondSuccess(item, 200);
    }

    const item = await updateSejarahItem(entityId, body || {});
    return respondSuccess(item, 200);
  } catch (error) {
    logger.error("Error updating sejarah item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to update sejarah item", 500));
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.update", "team.delete"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid sejarah id", 400));

    const result = await deleteSejarahItem(entityId);
    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error deleting sejarah item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to delete sejarah item", 500));
  }
}

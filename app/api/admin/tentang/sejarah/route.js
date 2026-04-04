import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getSejarahItems, createSejarahItem, createSejarahItemWithFile } from "../../../../../modules/admin/tentang/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const data = await getSejarahItems({
      isActive: isActive === null ? null : isActive === "true",
    });
    return respondSuccess({ items: data }, 200);
  } catch (error) {
    logger.error("Error fetching sejarah items", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch sejarah items", 500));
  }
}

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.create"]);

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

      const item = await createSejarahItemWithFile(body, uploadedFile);
      return respondSuccess(item, 201);
    }

    const item = await createSejarahItem(body || {});
    return respondSuccess(item, 201);
  } catch (error) {
    logger.error("Error creating sejarah item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to create sejarah item", 500));
  }
}

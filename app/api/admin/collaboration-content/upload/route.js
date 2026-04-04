import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart.js";
import Uploads from "../../../../../lib/upload/uploads.js";

const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

function isManagedUploadSource(source) {
  if (!source) return false;
  const value = String(source).trim();
  if (!value) return false;

  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) return true;

  const publicS3 = process.env.S3_PUBLIC_URL;
  if (publicS3 && value.startsWith(publicS3.replace(/\/$/, ""))) return true;

  return false;
}

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);

    const { fields, files } = await parseMultipartForm(request, {
      maxFileSize: MAX_UPLOAD_SIZE,
    });

    if (!files || files.length === 0) {
      return respondError(new AppError("Tidak ada file yang diupload", 400));
    }

    const file = files.find((item) => item.fieldname === "image") || files[0];
    const allowedTypes = ["image/*"];

    if (!validateFileMimeType(file, allowedTypes)) {
      return respondError(new AppError("Format file tidak didukung. Gunakan gambar (jpg, png, webp).", 415));
    }

    if (!validateFileSize(file, MAX_UPLOAD_SIZE)) {
      return respondError(new AppError("Ukuran file melebihi batas 3MB.", 413));
    }

    const uploads = new Uploads();
    const result = await uploads.handleUpload(file);
    const oldUrl = typeof fields?.oldUrl === "string" ? fields.oldUrl.trim() : "";

    if (oldUrl && oldUrl !== result.url && isManagedUploadSource(oldUrl)) {
      try {
        await uploads.deleteFile(oldUrl);
      } catch (deleteError) {
        logger.warn("Failed to delete old collaboration image after replacement", {
          oldUrl,
          error: deleteError && (deleteError.stack || deleteError.message || deleteError),
        });
      }
    }

    return respondSuccess(
      {
        url: result.url,
        path: result.path,
      },
      201,
    );
  } catch (error) {
    logger.error("Error uploading collaboration image", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengupload gambar kolaborasi", 500));
  }
}

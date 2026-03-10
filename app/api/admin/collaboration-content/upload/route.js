import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart.js";
import Uploads from "../../../../../lib/upload/uploads.js";

const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);

    const { files } = await parseMultipartForm(request, {
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

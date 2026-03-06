/**
 * POST /api/admin/platform-content/[id]/images/upload
 *
 * Terima multipart/form-data dengan field `file`, upload file ke storage,
 * lalu simpan record PlatformContentImage dengan imageUrl hasil upload.
 */
import { respondSuccess, respondError, AppError } from "../../../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType } from "../../../../../../../lib/upload/multipart.js";
import Uploads from "../../../../../../../lib/upload/uploads.js";
import {
  getPlatformContent,
  addContentImage,
} from "../../../../../../../modules/admin/platform.content/index.js";

const postHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][IMAGE:UPLOAD] Start", { contentId: id });
    await requireAuthWithPermission(request, ["platform.update"]);

    // Pastikan konten ada
    await getPlatformContent(id);

    // Parse multipart
    const { files } = await parseMultipartForm(request, { maxFileSize: 10 * 1024 * 1024 });
    if (!files || files.length === 0) {
      throw new AppError("Tidak ada file yang diupload", 400, "VALIDATION_ERROR");
    }

    const file = files[0];
    if (!validateFileMimeType(file, ["image/*"])) {
      throw new AppError("File harus berupa gambar (jpg, png, webp, dll)", 400, "VALIDATION_ERROR");
    }

    // Upload ke storage (local atau S3 tergantung env)
    const uploader = new Uploads();
    const { url } = await uploader.handleUpload(file);

    // Simpan record gambar
    const image = await addContentImage(id, {
      imageUrl: url,
      alt: file.originalFilename || null,
    });

    logInfo("[PlatformContent][Admin][IMAGE:UPLOAD] Success", { imageId: image.id, contentId: id, url });
    return respondSuccess(image, 201);
  } catch (error) {
    logError("[PlatformContent][Admin][IMAGE:UPLOAD] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengupload gambar", 500));
  }
};

export const POST = withApiLogging(postHandler, "api/admin/platform-content/[id]/images/upload");

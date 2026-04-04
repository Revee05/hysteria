/**
 * GET    /api/admin/platform-content/[id]  — ambil satu konten
 * PATCH  /api/admin/platform-content/[id]  — update sebagian field konten; terima multipart atau JSON
 * DELETE /api/admin/platform-content/[id]  — hapus konten
 */
import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType } from "../../../../../lib/upload/multipart.js";
const ALLOWED_IMAGE_MIMES = ["image/webp", "image/jpeg", "image/png"];
import Uploads from "../../../../../lib/upload/uploads.js";
import {
  getPlatformContent,
  updatePlatformContent,
  deletePlatformContent,
  addContentImage,
  removeContentImage,
} from "../../../../../modules/admin/platform.content/index.js";

// ─── GET ─────────────────────────────────────────────────────────────────────

const getHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][GET] Start", { id });
    await requireAuthWithPermission(request, ["platform.read"]);

    const content = await getPlatformContent(id);

    logInfo("[PlatformContent][Admin][GET] Success", { id });
    return respondSuccess(content, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][GET] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengambil konten", 500));
  }
};

export const GET = withApiLogging(getHandler, "api/admin/platform-content/[id]");

// ─── PATCH ───────────────────────────────────────────────────────────────────

const patchHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][PATCH] Start", { id });
    await requireAuthWithPermission(request, ["platform.update"]);

    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data");
    let body;
    let imageFiles = [];
    if (isMultipart) {
      const { fields, files } = await parseMultipartForm(request, { maxFileSize: 10 * 1024 * 1024 });
      body = fields;
      imageFiles = files.filter((f) => validateFileMimeType(f, ALLOWED_IMAGE_MIMES));
      const invalid = files.some((f) => !validateFileMimeType(f, ALLOWED_IMAGE_MIMES));
      if (invalid) throw new AppError("Tipe file tidak diperbolehkan. Hanya webp, jpg/jpeg, png.", 400, "VALIDATION_ERROR");
    } else {
      body = await request.json();
    }

    const updated = await updatePlatformContent(id, body);

    if (imageFiles.length > 0) {
      // Hapus gambar lama (file + record DB) sebelum menambah gambar baru
      const existingContent = await getPlatformContent(id);
      if (existingContent?.images?.length > 0) {
        const uploader = new Uploads();
        for (const img of existingContent.images) {
          try { await uploader.deleteFile(img.imageUrl); } catch (_) {}
          await removeContentImage(img.id);
        }
      }
      const uploader = new Uploads();
      for (const file of imageFiles) {
        const { url } = await uploader.handleUpload(file);
        await addContentImage(id, { imageUrl: url, alt: file.originalFilename || null });
      }
    }

    logInfo("[PlatformContent][Admin][PATCH] Success", { id });
    return respondSuccess(updated, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][PATCH] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengupdate konten", 500));
  }
};

export const PATCH = withApiLogging(patchHandler, "api/admin/platform-content/[id]");

// ─── DELETE ──────────────────────────────────────────────────────────────────

const deleteHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][DELETE] Start", { id });
    await requireAuthWithPermission(request, ["platform.delete"]);

    await deletePlatformContent(id);

    logInfo("[PlatformContent][Admin][DELETE] Success", { id });
    return respondSuccess({ id: parseInt(id, 10) }, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][DELETE] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal menghapus konten", 500));
  }
};

export const DELETE = withApiLogging(deleteHandler, "api/admin/platform-content/[id]");

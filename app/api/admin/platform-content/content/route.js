/**
 * GET  /api/admin/platform-content?platformId=<id>[&categoryItemId=<id>]
 *      — list semua konten milik platform, dengan filter kategori opsional
 * POST /api/admin/platform-content
 *      — buat konten baru; terima multipart/form-data (dengan gambar) atau JSON
 */
import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType } from "../../../../../lib/upload/multipart.js";
import Uploads from "../../../../../lib/upload/uploads.js";
import {
  listPlatformContents,
  listPlatformContentsBySlug,
  createPlatformContent,
  addContentImage,
} from "../../../../../modules/admin/platform.content/index.js";

const ALLOWED_IMAGE_MIMES = ["image/webp", "image/jpeg", "image/png"];

// ─── GET ─────────────────────────────────────────────────────────────────────

const getHandler = async (request) => {
  try {
    logInfo("[PlatformContent][Admin][LIST] Start");
    await requireAuthWithPermission(request, ["platform.read"]);

    const { searchParams } = new URL(request.url);
    const platformId       = searchParams.get("platformId");
    const platformSlug     = searchParams.get("platformSlug");
    const categoryItemId   = searchParams.get("categoryItemId") ?? null;
    const categoryItemSlug = searchParams.get("categoryItemSlug") ?? null;
    const minimalParam     = (searchParams.get('minimal') || '').toLowerCase();
    const minimal = minimalParam === '1' || minimalParam === 'true' || minimalParam === 'yes';

    if (!platformId && !platformSlug) {
      return respondError(new AppError("Query parameter 'platformSlug' atau 'platformId' wajib diisi", 400, "VALIDATION_ERROR"));
    }

    let contents;
    if (platformSlug) {
      // Gunakan slug — tidak perlu lookup platformId di frontend
      contents = await listPlatformContentsBySlug(platformSlug, categoryItemSlug, minimal);
    } else {
      contents = await listPlatformContents(platformId, categoryItemId, minimal);
    }

    logInfo("[PlatformContent][Admin][LIST] Success", { platformId, platformSlug, count: contents.length });
    return respondSuccess(contents, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][LIST] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengambil daftar konten", 500));
  }
};

export const GET = withApiLogging(getHandler, "api/admin/platform-content");

// ─── POST ────────────────────────────────────────────────────────────────────

const postHandler = async (request) => {
  try {
    logInfo("[PlatformContent][Admin][CREATE] Start");
    await requireAuthWithPermission(request, ["platform.update"]);

    // Terima multipart (ada gambar) atau JSON biasa
    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data");
    let body;
    let imageFiles = [];
    if (isMultipart) {
      const { fields, files } = await parseMultipartForm(request, { maxFileSize: 10 * 1024 * 1024 });
      body = fields;
      imageFiles = files.filter((f) => validateFileMimeType(f, ALLOWED_IMAGE_MIMES));
      // If any file had invalid mime, reject
      const invalid = files.some((f) => !validateFileMimeType(f, ALLOWED_IMAGE_MIMES));
      if (invalid) throw new AppError("Tipe file tidak diperbolehkan. Hanya webp, jpg/jpeg, png.", 400, "VALIDATION_ERROR");
    } else {
      body = await request.json();
    }

    const content = await createPlatformContent(body);

    // Upload gambar dan simpan record
    if (imageFiles.length > 0) {
      const uploader = new Uploads();
      for (const file of imageFiles) {
        const { url } = await uploader.handleUpload(file);
        await addContentImage(content.id, { imageUrl: url, alt: file.originalFilename || null });
      }
    }

    logInfo("[PlatformContent][Admin][CREATE] Success", { id: content.id });
    return respondSuccess(content, 201);
  } catch (error) {
    logError("[PlatformContent][Admin][CREATE] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal membuat konten", 500));
  }
};

export const POST = withApiLogging(postHandler, "api/admin/platform-content");

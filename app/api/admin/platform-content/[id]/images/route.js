/**
 * GET  /api/admin/platform-content/[id]/images  — list gambar milik konten
 * POST /api/admin/platform-content/[id]/images  — tambah gambar ke konten
 */
import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import {
  getPlatformContent,
  addContentImage,
} from "../../../../../../modules/admin/platform.content/index.js";

// ─── GET ─────────────────────────────────────────────────────────────────────

const getHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][IMAGE:LIST] Start", { contentId: id });
    await requireAuthWithPermission(request, ["platform.read"]);

    const content = await getPlatformContent(id);

    logInfo("[PlatformContent][Admin][IMAGE:LIST] Success", { contentId: id, count: content.images?.length ?? 0 });
    return respondSuccess(content.images ?? [], 200);
  } catch (error) {
    logError("[PlatformContent][Admin][IMAGE:LIST] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengambil daftar gambar", 500));
  }
};

export const GET = withApiLogging(getHandler, "api/admin/platform-content/[id]/images");

// ─── POST ────────────────────────────────────────────────────────────────────

const postHandler = async (request, { params }) => {
  try {
    const { id } = await params;
    logInfo("[PlatformContent][Admin][IMAGE:ADD] Start", { contentId: id });
    await requireAuthWithPermission(request, ["platform.update"]);

    const body = await request.json();
    const image = await addContentImage(id, body);

    logInfo("[PlatformContent][Admin][IMAGE:ADD] Success", { imageId: image.id });
    return respondSuccess(image, 201);
  } catch (error) {
    logError("[PlatformContent][Admin][IMAGE:ADD] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal menambah gambar", 500));
  }
};

export const POST = withApiLogging(postHandler, "api/admin/platform-content/[id]/images");

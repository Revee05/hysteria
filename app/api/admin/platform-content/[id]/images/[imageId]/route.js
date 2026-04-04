/**
 * PATCH  /api/admin/platform-content/[id]/images/[imageId]  — update gambar
 * DELETE /api/admin/platform-content/[id]/images/[imageId]  — hapus gambar
 */
import { respondSuccess, respondError, AppError } from "../../../../../../../lib/response.js";
import { withApiLogging, logInfo, logError } from "../../../../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../../../../lib/helper/permission.helper.js";
import {
  updateContentImage,
  removeContentImage,
} from "../../../../../../../modules/admin/platform.content/index.js";

// ─── PATCH ───────────────────────────────────────────────────────────────────

const patchHandler = async (request, { params }) => {
  try {
    const { imageId } = await params;
    logInfo("[PlatformContent][Admin][IMAGE:UPDATE] Start", { imageId });
    await requireAuthWithPermission(request, ["platform.update"]);

    const body = await request.json();
    const updated = await updateContentImage(imageId, body);

    logInfo("[PlatformContent][Admin][IMAGE:UPDATE] Success", { imageId });
    return respondSuccess(updated, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][IMAGE:UPDATE] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal mengupdate gambar", 500));
  }
};

export const PATCH = withApiLogging(patchHandler, "api/admin/platform-content/[id]/images/[imageId]");

// ─── DELETE ──────────────────────────────────────────────────────────────────

const deleteHandler = async (request, { params }) => {
  try {
    const { imageId } = await params;
    logInfo("[PlatformContent][Admin][IMAGE:DELETE] Start", { imageId });
    await requireAuthWithPermission(request, ["platform.delete"]);

    await removeContentImage(imageId);

    logInfo("[PlatformContent][Admin][IMAGE:DELETE] Success", { imageId });
    return respondSuccess({ id: parseInt(imageId, 10) }, 200);
  } catch (error) {
    logError("[PlatformContent][Admin][IMAGE:DELETE] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Gagal menghapus gambar", 500));
  }
};

export const DELETE = withApiLogging(deleteHandler, "api/admin/platform-content/[id]/images/[imageId]");

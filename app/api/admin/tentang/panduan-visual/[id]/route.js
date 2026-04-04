import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import logger from "../../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import { getPanduanVisualById, updatePanduanVisual, deletePanduanVisual } from "../../../../../../modules/admin/tentang/index.js";

export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid panduan visual id", 400));

    const item = await getPanduanVisualById(entityId);
    return respondSuccess(item, 200);
  } catch (error) {
    logger.error("Error fetching panduan visual item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch panduan visual item", 500));
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid panduan visual id", 400));

    const body = await request.json();
    const item = await updatePanduanVisual(entityId, body || {});
    return respondSuccess(item, 200);
  } catch (error) {
    logger.error("Error updating panduan visual item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to update panduan visual item", 500));
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, ["tentang.delete"]);
    const { id } = await params;
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return respondError(new AppError("Invalid panduan visual id", 400));

    const result = await deletePanduanVisual(entityId);
    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error deleting panduan visual item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to delete panduan visual item", 500));
  }
}

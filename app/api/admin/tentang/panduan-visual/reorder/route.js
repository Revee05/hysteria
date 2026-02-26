import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import logger from "../../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import { reorderPanduanVisualItems } from "../../../../../../modules/admin/tentang/index.js";

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.update", "team.update"]);
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const result = await reorderPanduanVisualItems(items);
    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error reordering panduan visual items", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to reorder panduan visual items", 500));
  }
}

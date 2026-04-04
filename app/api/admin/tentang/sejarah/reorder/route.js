import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import logger from "../../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import { reorderSejarahItems } from "../../../../../../modules/admin/tentang/index.js";

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const result = await reorderSejarahItems(items);
    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error reordering sejarah items", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to reorder sejarah items", 500));
  }
}

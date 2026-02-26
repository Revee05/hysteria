import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import { listPlatforms } from "../../../../modules/admin/platform/index.js";

export async function GET(request) {
  try {
    logger.info("[Platform][Admin][GET-ALL] Start");
    await requireAuthWithPermission(request, ["platform.read"]);

    const platforms = await listPlatforms();

    logger.info("[Platform][Admin][GET-ALL] Success", { count: platforms.length });
    return respondSuccess(platforms, 200);
  } catch (error) {
    logger.error("[Platform][Admin][GET-ALL] Error", { error: error?.stack || error?.message });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch platforms", 500));
  }
}

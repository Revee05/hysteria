import { respondSuccess, respondError, AppError } from "../../../../../../lib/response.js";
import logger from "../../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../../lib/helper/permission.helper.js";
import { getPlatformImages } from "../../../../../../modules/admin/platform/index.js";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || null;

    logger.info("[Platform][Admin][IMAGES][GET] Start", { slug, type });
    await requireAuthWithPermission(request, ["platform.read"]);

    if (type && !["cover", "hero"].includes(type)) {
      return respondError(new AppError("Invalid type filter. Use 'cover' or 'hero'.", 400, "INVALID_TYPE"));
    }

    const images = await getPlatformImages(slug, type);

    logger.info("[Platform][Admin][IMAGES][GET] Success", { slug, type, count: images.length });
    return respondSuccess(images, 200);
  } catch (error) {
    logger.error("[Platform][Admin][IMAGES][GET] Error", { error: error?.stack || error?.message });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch platform images", 500));
  }
}

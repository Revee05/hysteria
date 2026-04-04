import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getPanduanVisualItems, createPanduanVisual } from "../../../../../modules/admin/tentang/index.js";

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const data = await getPanduanVisualItems({
      isActive: isActive === null ? null : isActive === "true",
    });
    return respondSuccess({ items: data }, 200);
  } catch (error) {
    logger.error("Error fetching panduan visual items", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch panduan visual items", 500));
  }
}

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.create"]);
    const body = await request.json();
    const data = await createPanduanVisual(body || {});
    return respondSuccess(data, 201);
  } catch (error) {
    logger.error("Error creating panduan visual item", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to create panduan visual item", 500));
  }
}

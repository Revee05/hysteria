import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { getPublicSejarahItems } from "../../../../modules/admin/tentang/index.js";

export async function GET() {
  try {
    const items = await getPublicSejarahItems();
    return respondSuccess({ items }, 200);
  } catch (error) {
    logger.error("Error fetching public sejarah items", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch sejarah items", 500));
  }
}

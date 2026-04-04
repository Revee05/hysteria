import { respondSuccess, respondError, AppError } from "../../../lib/response.js";
import logger from "../../../lib/logger.js";
import { getPublicCollaborationContent } from "../../../modules/admin/collaboration/index.js";

export async function GET() {
  try {
    const collaboration = await getPublicCollaborationContent();
    return respondSuccess(collaboration, 200);
  } catch (error) {
    logger.error("Error fetching public collaboration content", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch collaboration content", 500));
  }
}

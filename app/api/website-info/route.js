import { respondSuccess, respondError, AppError } from "../../../lib/response.js";
import logger from "../../../lib/logger.js";
import { getPublicWebsiteInfo } from "../../../modules/admin/websiteInfo/index.js";

export async function GET() {
  try {
    const websiteInfo = await getPublicWebsiteInfo();
    return respondSuccess({ websiteInfo }, 200);
  } catch (error) {
    logger.error("Error fetching public website info", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch website info", 500));
  }
}

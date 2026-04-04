import { respondSuccess, respondError, AppError } from "../../../lib/response.js";
import logger from "../../../lib/logger.js";
import { getPublicContactSection } from "../../../modules/admin/contact/index.js";

export async function GET() {
  try {
    const contact = await getPublicContactSection();
    return respondSuccess({ contact }, 200);
  } catch (error) {
    logger.error("Error fetching public contact section", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch contact section", 500));
  }
}

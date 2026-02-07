import { respondSuccess, respondError, AppError } from "../../../lib/response.js";
import logger from "../../../lib/logger.js";
import { getActiveTeamCategoriesWithMembers } from "../../../modules/admin/team/index.js";

// GET - Fetch active team categories with members (public)
export async function GET() {
  try {
    const categories = await getActiveTeamCategoriesWithMembers();
    return respondSuccess({ categories }, 200);
  } catch (error) {
    logger.error("Error fetching team data", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch team data", 500));
  }
}

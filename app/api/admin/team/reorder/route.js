import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { reorderTeamCategories, reorderTeamMembers } from "../../../../../modules/admin/team/index.js";

export async function POST(request) {
  try {
    await requireAuthWithPermission(request, "team.update");

    const body = await request.json();
    const categories = Array.isArray(body?.categories) ? body.categories : [];
    const members = Array.isArray(body?.members) ? body.members : [];

    const result = {
      categoriesUpdated: 0,
      membersUpdated: 0,
    };

    if (categories.length > 0) {
      const res = await reorderTeamCategories(categories);
      result.categoriesUpdated = res.count || 0;
    }

    if (members.length > 0) {
      const res = await reorderTeamMembers(members);
      result.membersUpdated = res.count || 0;
    }

    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error reordering team entities", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to reorder team entities", 500));
  }
}

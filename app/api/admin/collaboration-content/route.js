import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import {
  getAdminCollaborationContent,
  upsertAdminCollaborationContent,
} from "../../../../modules/admin/collaboration/index.js";

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const collaboration = await getAdminCollaborationContent();
    return respondSuccess({ collaboration }, 200);
  } catch (error) {
    logger.error("Error fetching admin collaboration content", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch collaboration content", 500));
  }
}

export async function PUT(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);
    const body = await request.json();
    const collaboration = await upsertAdminCollaborationContent(body || {});
    return respondSuccess({ collaboration }, 200);
  } catch (error) {
    logger.error("Error saving admin collaboration content", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save collaboration content", 500));
  }
}

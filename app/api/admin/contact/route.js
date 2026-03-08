import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import { getAdminContactSection, upsertAdminContactSection } from "../../../../modules/admin/contact/index.js";

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const contact = await getAdminContactSection();
    return respondSuccess({ contact }, 200);
  } catch (error) {
    logger.error("Error fetching admin contact section", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch contact section", 500));
  }
}

export async function PUT(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);
    const body = await request.json();
    const contact = await upsertAdminContactSection(body || {});
    return respondSuccess({ contact }, 200);
  } catch (error) {
    logger.error("Error saving admin contact section", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save contact section", 500));
  }
}

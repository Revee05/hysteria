import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getTentangVisiMisi, upsertTentangVisiMisi } from "../../../../../modules/admin/tentang/index.js";

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.read", "team.read"]);
    const data = await getTentangVisiMisi();
    return respondSuccess(data, 200);
  } catch (error) {
    logger.error("Error fetching tentang visi misi", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch visi misi", 500));
  }
}

export async function PUT(request) {
  try {
    await requireAuthWithPermission(request, ["team-about-hero.update", "team.update"]);
    const body = await request.json();
    const data = await upsertTentangVisiMisi(body || {});
    return respondSuccess(data, 200);
  } catch (error) {
    logger.error("Error saving tentang visi misi", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save visi misi", 500));
  }
}

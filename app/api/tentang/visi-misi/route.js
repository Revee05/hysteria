import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { getPublicTentangVisiMisi } from "../../../../modules/admin/tentang/index.js";

export async function GET() {
  try {
    const data = await getPublicTentangVisiMisi();
    return respondSuccess(data, 200);
  } catch (error) {
    logger.error("Error fetching public visi misi", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch visi misi", 500));
  }
}

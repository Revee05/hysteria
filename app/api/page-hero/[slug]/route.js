import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { getPageHeroBySlug } from "../../../../modules/admin/pageHero/index.js";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    logger.info("[PageHero][Public][GET] Start", { slug });
    const hero = await getPageHeroBySlug(slug);
    logger.info("[PageHero][Public][GET] Success", { slug, found: !!hero });

    return respondSuccess(hero, 200);
  } catch (error) {
    logger.error("Error fetching public page hero", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch page hero", 500));
  }
}

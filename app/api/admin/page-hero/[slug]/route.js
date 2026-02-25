import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getPageHeroBySlug, upsertPageHeroBySlug, upsertPageHeroWithFile } from "../../../../../modules/admin/pageHero/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const normalizeClearImagePayload = (payload = {}) => {
  const shouldClearImage = payload?.clearImage === true || payload?.clearImage === "true";
  if (!shouldClearImage) return payload;

  const normalized = { ...payload, imageUrl: null };
  delete normalized.clearImage;
  return normalized;
};

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    logger.info("[PageHero][Admin][GET] Start", { slug });
    await requireAuthWithPermission(request, ["team-about-hero.read", "team.read"]);

    const hero = await getPageHeroBySlug(slug);

    logger.info("[PageHero][Admin][GET] Success", { slug, found: !!hero });

    return respondSuccess(hero, 200);
  } catch (error) {
    logger.error("Error fetching page hero", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch page hero", 500));
  }
}

export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    logger.info("[PageHero][Admin][PUT] Start", { slug });

    await requireAuthWithPermission(request, ["team-about-hero.update", "team.update"]);

    const contentType = request.headers.get("content-type") || "";
    logger.info("[PageHero][Admin][PUT] Content-Type", { slug, contentType });

    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });

      const uploadedFile = (files || []).find((file) => file.fieldname === "imageUrl") || null;
      logger.info("[PageHero][Admin][PUT] Parsed multipart", {
        slug,
        hasFile: !!uploadedFile,
        fieldKeys: Object.keys(fields || {}),
      });

      if (uploadedFile) {
        const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (!validateFileMimeType(uploadedFile, allowedTypes)) {
          logger.warn("[PageHero][Admin][PUT] Invalid mime type", {
            slug,
            mimeType: uploadedFile.mimetype,
            allowedTypes,
          });
          return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
        }

        if (!validateFileSize(uploadedFile, MAX_UPLOAD_SIZE)) {
          logger.warn("[PageHero][Admin][PUT] File too large", {
            slug,
            size: uploadedFile.size,
            max: MAX_UPLOAD_SIZE,
          });
          return respondError(new AppError(`File too large. Maximum size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 413));
        }

        const hero = await upsertPageHeroWithFile(slug, fields || {}, uploadedFile);
        logger.info("[PageHero][Admin][PUT] Success (multipart)", { slug, hasImage: !!hero?.imageUrl });
        return respondSuccess(hero, 200);
      }

      const normalizedFields = normalizeClearImagePayload(fields || {});
      const hero = await upsertPageHeroBySlug(slug, normalizedFields);
      logger.info("[PageHero][Admin][PUT] Success (multipart without file)", { slug, hasImage: !!hero?.imageUrl });
      return respondSuccess(hero, 200);
    }

    const body = await request.json();
    logger.info("[PageHero][Admin][PUT] Parsed JSON body", {
      slug,
      bodyKeys: Object.keys(body || {}),
      hasImageUrl: !!body?.imageUrl,
    });

    const normalizedBody = normalizeClearImagePayload(body || {});
    const hero = await upsertPageHeroBySlug(slug, normalizedBody);
    logger.info("[PageHero][Admin][PUT] Success (json)", { slug, hasImage: !!hero?.imageUrl });
    return respondSuccess(hero, 200);
  } catch (error) {
    logger.error("Error upserting page hero", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to save page hero", 500));
  }
}

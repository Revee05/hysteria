import { AppError, respondError, respondSuccess } from "../../../../lib/response.js";
import { withApiLogging, logError } from "../../../../lib/api-logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import { getHomepagePlatformSettings, saveHomepagePlatformSettings } from "../../../../modules/admin/homepagePlatform/index.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../lib/upload/multipart.js";
import Uploads from "../../../../lib/upload/uploads.js";

const getHandler = async (request) => {
  try {
    await requireAuthWithPermission(request, ["platform.read"]);
    const data = await getHomepagePlatformSettings();
    return respondSuccess(data, 200);
  } catch (error) {
    logError("[HomepagePlatform][Admin][GET] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch homepage platform settings", 500));
  }
};

const putHandler = async (request) => {
  try {
    await requireAuthWithPermission(request, ["platform.update"]);
    let payload;

    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("multipart/form-data")) {
      // parse multipart, upload files first and inject URLs into payload
      const { fields, files } = await parseMultipartForm(request, { maxFileSize: 10 * 1024 * 1024 });

      // fields.cards expected as JSON string
      const cardsRaw = fields.cards ? JSON.parse(fields.cards) : [];

      // prepare uploads
      const uploads = new Uploads();

      // map files by fieldname (expecting names like image_0, image_1)
      const fileMap = {};
      for (const f of files || []) {
        fileMap[f.fieldname] = f;
      }

      // attach uploaded URLs to cards
      for (let i = 0; i < (cardsRaw || []).length; i++) {
        const key = `image_${i}`;
        if (fileMap[key]) {
          const file = fileMap[key];
          // basic validation: image mime and size
          if (!validateFileMimeType(file, ["image/*"])) {
            throw new AppError("Tipe file tidak didukung untuk image card", 400, "VALIDATION_ERROR");
          }
          if (!validateFileSize(file, 10 * 1024 * 1024)) {
            throw new AppError("Ukuran file melebihi batas 10MB", 400, "VALIDATION_ERROR");
          }

          const result = await uploads.handleUploadProduct(file);
          cardsRaw[i].imageUrl = result.url;
        }
      }

      payload = { cards: cardsRaw };
    } else {
      payload = await request.json();
    }

    const cards = await saveHomepagePlatformSettings(payload || {});
    return respondSuccess({ cards }, 200);
  } catch (error) {
    logError("[HomepagePlatform][Admin][PUT] Error", error);
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save homepage platform settings", 500));
  }
};

export const GET = withApiLogging(getHandler, "api/admin/homepage-platform");
export const PUT = withApiLogging(putHandler, "api/admin/homepage-platform");

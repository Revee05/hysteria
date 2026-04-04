import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../lib/upload/multipart.js";
import { getAdminWebsiteInfo, upsertAdminWebsiteInfo } from "../../../../modules/admin/websiteInfo/index.js";

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["website-info.read"]);
    const websiteInfo = await getAdminWebsiteInfo();
    return respondSuccess({ websiteInfo }, 200);
  } catch (error) {
    logger.error("Error fetching admin website info", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch website info", 500));
  }
}

export async function PUT(request) {
  try {
    await requireAuthWithPermission(request, ["website-info.update"]);

    const contentType = request.headers.get("content-type") || "";
    let fields = {};
    let files = [];

    if (contentType.includes("multipart/form-data")) {
      const parsed = await parseMultipartForm(request, { maxFileSize: MAX_UPLOAD_SIZE });
      fields = parsed.fields || {};
      files = parsed.files || [];
    } else {
      fields = await request.json();
    }

    const logoWebsiteFile = files.find((file) => file.fieldname === "logoWebsiteFile");
    const faviconWebsiteFile = files.find((file) => file.fieldname === "faviconWebsiteFile");

    if (logoWebsiteFile) {
      if (!validateFileMimeType(logoWebsiteFile, ["image/*"])) {
        throw new AppError("Logo website harus berupa file gambar", 415, "INVALID_FILE_TYPE");
      }
      if (!validateFileSize(logoWebsiteFile, MAX_UPLOAD_SIZE)) {
        throw new AppError("Ukuran logo website maksimal 2MB", 413, "FILE_TOO_LARGE");
      }
    }

    if (faviconWebsiteFile) {
      if (!validateFileMimeType(faviconWebsiteFile, ["image/*"])) {
        throw new AppError("Favicon website harus berupa file gambar", 415, "INVALID_FILE_TYPE");
      }
      if (!validateFileSize(faviconWebsiteFile, MAX_UPLOAD_SIZE)) {
        throw new AppError("Ukuran favicon website maksimal 2MB", 413, "FILE_TOO_LARGE");
      }
    }

    const websiteInfo = await upsertAdminWebsiteInfo(fields || {}, { logoWebsiteFile, faviconWebsiteFile });
    return respondSuccess({ websiteInfo }, 200);
  } catch (error) {
    logger.error("Error saving admin website info", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save website info", 500));
  }
}

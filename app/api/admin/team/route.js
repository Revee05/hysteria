import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import { getTeamCategoriesWithMembers, createTeamCategory, createTeamMember, createTeamMemberWithFile } from "../../../../modules/admin/team/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const resolveType = (request, payload = {}) => {
  const { searchParams } = new URL(request.url);
  return payload?.type || searchParams.get("type");
};

// GET - Fetch team categories with members
export async function GET(request) {
  try {
    await requireAuthWithPermission(request, "team.read");

    const { searchParams } = new URL(request.url);
    const perPage = searchParams.get("perPage");
    const cursor = searchParams.get("cursor");
    const isActive = searchParams.get("isActive");

    const perPageValue = perPage ? parseInt(perPage, 10) : undefined;
    const cursorValue = cursor ? parseInt(cursor, 10) : undefined;

    const options = {
      perPage: Number.isFinite(perPageValue) && perPageValue > 0 ? perPageValue : 50,
      cursor: Number.isFinite(cursorValue) && cursorValue > 0 ? cursorValue : null,
      isActive: isActive === null ? null : isActive === "true",
    };

    const result = await getTeamCategoriesWithMembers(options);
    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error fetching team categories", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch team data", 500));
  }
}

// POST - Create team category or member
export async function POST(request) {
  try {
    await requireAuthWithPermission(request, "team.create");
    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let uploadedFile = null;

    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });
      body = fields;
      uploadedFile = (files || []).find((file) => file.fieldname === "imageUrl") || null;
      if (body.isActive !== undefined) {
        body.isActive = body.isActive === "true" || body.isActive === true;
      }
    } else {
      body = await request.json();
    }

    const type = resolveType(request, body);

    if (type === "category") {
      const category = await createTeamCategory(body);
      return respondSuccess(category, 201);
    }

    if (type === "member") {
      if (uploadedFile) {
        const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (!validateFileMimeType(uploadedFile, allowedTypes)) {
          return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
        }

        if (!validateFileSize(uploadedFile, MAX_UPLOAD_SIZE)) {
          return respondError(new AppError(`File too large. Maximum size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 413));
        }

        const member = await createTeamMemberWithFile(body, uploadedFile);
        return respondSuccess(member, 201);
      }

      const member = await createTeamMember(body);
      return respondSuccess(member, 201);
    }

    throw new AppError("Invalid team payload type", 400);
  } catch (error) {
    logger.error("Error creating team entity", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to create team entity", 500));
  }
}

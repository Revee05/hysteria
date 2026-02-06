import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import { getTeamCategoryById, updateTeamCategory, deleteTeamCategory, getTeamMemberById, updateTeamMember, updateTeamMemberWithFile, deleteTeamMember } from "../../../../../modules/admin/team/index.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const resolveType = (request, body) => {
  const { searchParams } = new URL(request.url);
  return body?.type || searchParams.get("type");
};

// GET - Fetch single team category or member
export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, "team.read");
    const { id } = await params;
    const entityId = parseInt(id, 10);
    if (!entityId || isNaN(entityId)) {
      return respondError(new AppError("Invalid team id", 400));
    }

    logger.info("API GET /api/admin/team/:id called", { id: entityId });

    const type = resolveType(request, {});
    logger.info("Resolved GET type for team entity", { id: entityId, type });

    if (type === "member") {
      logger.info("Fetching team member by id", { id: entityId });
      const member = await getTeamMemberById(entityId);
      logger.info("Fetched team member", { id: entityId });
      return respondSuccess(member, 200);
    }

    if (type === "category") {
      logger.info("Fetching team category by id", { id: entityId });
      const category = await getTeamCategoryById(entityId);
      logger.info("Fetched team category", { id: entityId });
      return respondSuccess(category, 200);
    }

    throw new AppError("Invalid team payload type", 400);
  } catch (error) {
    logger.error("Error fetching team entity", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch team entity", 500));
  }
}

// PUT - Update team category or member
export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, "team.update");

    const { id } = await params;
    const entityId = parseInt(id, 10);
    if (!entityId || isNaN(entityId)) {
      return respondError(new AppError("Invalid team id", 400));
    }
    logger.info("API PUT /api/admin/team/:id called", { id: entityId });

    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let uploadedFile = null;

    if (contentType.includes("multipart/form-data")) {
      logger.info("Detected multipart/form-data in PUT", { id: entityId });
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });
      body = fields;
      uploadedFile = (files || []).find((file) => file.fieldname === "imageUrl") || null;
      logger.info("Parsed multipart form fields and files", { id: entityId, fields: Object.keys(body), fileCount: (files || []).length });
      if (body.isActive !== undefined) {
        body.isActive = body.isActive === "true" || body.isActive === true;
      }
    } else {
      logger.info("Parsing JSON body for PUT", { id: entityId });
      body = await request.json();
    }

    const type = resolveType(request, body);
    logger.info("Resolved PUT type for team entity", { id: entityId, type });

    if (type === "member") {
      if (uploadedFile) {
        logger.info("PUT includes uploaded file for member", { id: entityId, fileName: uploadedFile?.originalname });
        const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (!validateFileMimeType(uploadedFile, allowedTypes)) {
          logger.warn("Uploaded file failed mime type validation", { id: entityId, mime: uploadedFile?.mimetype });
          return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
        }

        if (!validateFileSize(uploadedFile, MAX_UPLOAD_SIZE)) {
          logger.warn("Uploaded file exceeded size limit", { id: entityId, size: uploadedFile?.size });
          return respondError(new AppError(`File too large. Maximum size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 413));
        }

        const member = await updateTeamMemberWithFile(entityId, body, uploadedFile);
        logger.info("Updated team member with file", { id: entityId });
        return respondSuccess(member, 200);
      }

      logger.info("Updating team member without file", { id: entityId });
      const member = await updateTeamMember(entityId, body);
      logger.info("Updated team member", { id: entityId });
      return respondSuccess(member, 200);
    }

    if (type === "category") {
      logger.info("Updating team category", { id: entityId });
      const category = await updateTeamCategory(entityId, body);
      logger.info("Updated team category", { id: entityId });
      return respondSuccess(category, 200);
    }

    throw new AppError("Invalid team payload type", 400);
  } catch (error) {
    logger.error("Error updating team entity", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to update team entity", 500));
  }
}

// DELETE - Delete team category or member
export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, "team.delete");

    const { id } = await params;
    const entityId = parseInt(id, 10);
    if (!entityId || isNaN(entityId)) {
      return respondError(new AppError("Invalid team id", 400));
    }

    logger.info("API DELETE /api/admin/team/:id called", { id: entityId });

    const type = resolveType(request, {});
    logger.info("Resolved DELETE type for team entity", { id: entityId, type });

    if (type === "member") {
      logger.info("API DELETE /api/admin/team/:id?type=member called", { id: entityId });
      const result = await deleteTeamMember(entityId);
      logger.info("Team member deleted", { id: entityId });
      return respondSuccess(result, 200);
    }

    if (type === "category") {
      logger.info("API DELETE /api/admin/team/:id?type=category called", { id: entityId });
      const result = await deleteTeamCategory(entityId);
      logger.info("Team category deleted", { id: entityId });
      return respondSuccess(result, 200);
    }

    throw new AppError("Invalid team payload type", 400);
  } catch (error) {
    logger.error("Error deleting team entity", { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to delete team entity", 500));
  }
}

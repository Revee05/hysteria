import { respondSuccess, respondError, AppError } from "../../../../../lib/response.js";
import logger from "../../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper.js";
import {
  getTeamCategoryById,
  updateTeamCategory,
  deleteTeamCategory,
  getTeamMemberById,
  updateTeamMember,
  updateTeamMemberWithFile,
  deleteTeamMember,
} from "../../../../../modules/admin/team/index.js";

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

    const type = resolveType(request, {});
    if (type === "member") {
      const member = await getTeamMemberById(entityId);
      return respondSuccess(member, 200);
    }

    if (type === "category") {
      const category = await getTeamCategoryById(entityId);
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

        const member = await updateTeamMemberWithFile(entityId, body, uploadedFile);
        logger.info('API PUT /api/admin/team/:id called with file upload', { id: entityId }); 
        return respondSuccess(member, 200);
      }

      const member = await updateTeamMember(entityId, body);
      return respondSuccess(member, 200);
    }

    if (type === "category") {
      const category = await updateTeamCategory(entityId, body);
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

    const type = resolveType(request, {});
    if (type === "member") {
      logger.info('API DELETE /api/admin/team/:id?type=member called', { id });
      const result = await deleteTeamMember(entityId);
      logger.info('Team member deleted', { id });
      return respondSuccess(result, 200);
    }

    if (type === "category") {
      logger.info('API DELETE /api/admin/team/:id?type=category called', { id });
      const result = await deleteTeamCategory(entityId);
      logger.info('Team category deleted', { id });
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

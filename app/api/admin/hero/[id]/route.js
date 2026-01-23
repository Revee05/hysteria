import { NextResponse } from "next/server";
import { respondSuccess, respondError, AppError } from "../../../../../lib/response";
import { requireAuthWithPermission } from "../../../../../lib/helper/permission.helper";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../../lib/upload/multipart";
import * as heroService from "../../../../../modules/hero/services/hero.service.js";

// GET - Fetch single hero
export async function GET(request, { params }) {
  try {
    await requireAuthWithPermission(request, "hero.read");

    const { id } = await params;
    const hero = await heroService.getHeroById(parseInt(id));

    return respondSuccess(hero, 200);
  } catch (error) {
    console.error("Error fetching hero:", error);
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch hero", 500));
  }
}

// PUT - Update hero (supports JSON or multipart with file upload)
export async function PUT(request, { params }) {
  try {
    await requireAuthWithPermission(request, "hero.update");

    const { id } = await params;
    const heroId = Number(id);
    
    if (!Number.isInteger(heroId)) {
      return respondError(new AppError("Invalid hero id", 400));
    }

    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let sourceUrl = null;

    // Check if multipart (has file upload)
    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE || `${10 * 1024 * 1024}`, 10),
      });

      body = fields;

      // Convert string boolean to actual boolean
      if (body.isActive !== undefined) {
        body.isActive = body.isActive === "true" || body.isActive === true;
      }

      // If no file uploaded, proceed with normal update via service (validation included)
      if (!files || files.length === 0) {
        const hero = await heroService.updateHero(heroId, body);
        return respondSuccess(hero, 200);
      }

      // File uploaded: use transactional upload service
      const file = files[0];

      // Validate MIME type
      const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*,video/*")
        .split(",")
        .map((t) => t.trim());

      if (!validateFileMimeType(file, allowedTypes)) {
        return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
      }

      // Validate size
      const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || `${10 * 1024 * 1024}`, 10);
      if (!validateFileSize(file, maxSize)) {
        return respondError(new AppError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`, 413));
      }

      // Use service function for transactional update with upload
      const hero = await heroService.updateHeroWithFile(heroId, body, file);
      return respondSuccess(hero, 200);
    } else {
      // Regular JSON body
      try {
        body = await request.json();
      } catch (e) {
        return respondError(new AppError("Invalid JSON body", 400));
      }
    }

    // Use uploaded file URL if available, otherwise keep existing or use provided source URL
    if (sourceUrl) {
      body.source = sourceUrl;
    }

    const hero = await heroService.updateHero(heroId, body);

    return respondSuccess(hero, 200);
  } catch (error) {
    console.error("Error updating hero:", error && (error.stack || error));
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to update hero", 500));
  }
}

// DELETE - Delete hero
export async function DELETE(request, { params }) {
  try {
    await requireAuthWithPermission(request, "hero.delete");

    const { id } = await params;
    await heroService.deleteHero(parseInt(id));

    return respondSuccess(null, 200);
  } catch (error) {
    console.error("Error deleting hero:", error);
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to delete hero", 500));
  }
}

import { NextResponse } from "next/server";
import { respondSuccess, respondError, AppError } from "../../../../lib/response";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper";
import logger from "../../../../lib/logger.js";
import { parseMultipartForm, validateFileMimeType, validateFileSize } from "../../../../lib/upload/multipart";
import * as heroService from "../../../../modules/admin/hero/services/hero.service.js";

// GET - Fetch all hero sections
export async function GET(request) {
  try {
    await requireAuthWithPermission(request, "hero.read");

    logger.info('API GET /api/admin/hero called', { url: request.url });

    // Parse query parameters with defaults
    const { searchParams } = new URL(request.url);
    
    const options = {
      perPage: 10,
      cursor: null,
      isActive: null,
    };

    // Only set if provided
    if (searchParams.has('perPage')) {
      const perPage = parseInt(searchParams.get('perPage'), 10);
      if (!isNaN(perPage) && perPage > 0 && perPage <= 100) {
        options.perPage = perPage;
      }
    }

    if (searchParams.has('cursor')) {
      const cursor = parseInt(searchParams.get('cursor'), 10);
      if (!isNaN(cursor) && cursor > 0) {
        options.cursor = cursor;
      }
    }

    if (searchParams.has('isActive')) {
      const isActive = searchParams.get('isActive');
      options.isActive = isActive === 'true';
    }

    const result = await heroService.getAllHeroes(options);

    logger.info('Fetched heroes', { count: Array.isArray(result.heroes) ? result.heroes.length : undefined });

    return respondSuccess(result, 200);
  } catch (error) {
    console.error("Error fetching heroes:", error);
    console.error("Error stack:", error.stack);
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to fetch heroes", 500));
  }
}

// POST - Create new hero section (supports JSON or multipart with file upload)
export async function POST(request) {
  try {
    await requireAuthWithPermission(request, "hero.create");
    logger.info('API POST /api/admin/hero called', { url: request.url, contentType: request.headers.get('content-type') });

    const contentType = request.headers.get("content-type") || "";
    let body = {};

    // Max upload size in bytes (adjust as needed)
    const MAX_UPLOAD_SIZE = 3 * 1024 * 1024; // 3MB

    // Check if multipart (has file upload)
    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipartForm(request, {
        maxFileSize: MAX_UPLOAD_SIZE,
      });

      body = fields;

      // Convert string boolean to actual boolean early
      if (body.isActive !== undefined) {
        body.isActive = body.isActive === "true" || body.isActive === true;
      }

      // If no file uploaded, just normal create flow
      if (!files || files.length === 0) {
        const hero = await heroService.createHero(body);
        logger.info('Hero created', { heroId: hero?.id });
        return respondSuccess(hero, 201);
      }

      // If file exists, use transactional upload service
      const file = files[0];

      // Validate MIME type
      const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/*,video/*")
        .split(",")
        .map((t) => t.trim());

      if (!validateFileMimeType(file, allowedTypes)) {
        return respondError(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 415));
      }

      // Validate size
      const maxSize = MAX_UPLOAD_SIZE;
      if (!validateFileSize(file, maxSize)) {
        return respondError(new AppError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`, 413));
      }

      // Use service function for transactional create with upload
      const hero = await heroService.createHeroWithFile(body, file);
      logger.info('Hero created with file', { heroId: hero?.id, file: file.originalFilename || file.newFilename || file.name });
      return respondSuccess(hero, 201);
    } else {
      // Regular JSON body
      body = await request.json();
      const hero = await heroService.createHero(body);
      logger.info('Hero created', { heroId: hero?.id });
      return respondSuccess(hero, 201);
    }
  } catch (error) {
    logger.error('Error creating hero', { error: error && (error.stack || error.message || error) });
    if (error instanceof AppError) {
      return respondError(error);
    }
    return respondError(new AppError("Failed to create hero", 500));
  }
}

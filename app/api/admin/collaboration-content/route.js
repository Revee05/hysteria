import { respondSuccess, respondError, AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import { requireAuthWithPermission } from "../../../../lib/helper/permission.helper.js";
import Uploads from "../../../../lib/upload/uploads.js";
import {
  getAdminCollaborationContent,
  upsertAdminCollaborationContent,
} from "../../../../modules/admin/collaboration/index.js";

function isManagedUploadSource(source) {
  if (!source) return false;
  const value = String(source).trim();
  if (!value) return false;

  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) return true;

  const publicS3 = process.env.S3_PUBLIC_URL;
  if (publicS3 && value.startsWith(publicS3.replace(/\/$/, ""))) return true;

  return false;
}

function collectCollaborationImageUrls(collaboration) {
  const groups = [collaboration?.whyBenefits, collaboration?.schemes, collaboration?.flowSteps];
  const urls = [];

  groups.forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item?.imageUrl) {
        urls.push(String(item.imageUrl).trim());
      }
    });
  });

  return urls.filter(Boolean);
}

function mapPrismaRouteError(error) {
  const code = error?.code;

  if (code === "P2021") {
    return new AppError("Collaboration content table is not available. Please run Prisma migrations.", 500);
  }

  if (code === "P2022") {
    return new AppError("Collaboration content schema is out of sync. Please run Prisma migrations.", 500);
  }

  return null;
}

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.read"]);
    const collaboration = await getAdminCollaborationContent();
    return respondSuccess({ collaboration }, 200);
  } catch (error) {
    logger.error("Error fetching admin collaboration content", { error: error && (error.stack || error.message || error) });

    const prismaError = mapPrismaRouteError(error);
    if (prismaError) return respondError(prismaError);

    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to fetch collaboration content", 500));
  }
}

export async function PUT(request) {
  try {
    await requireAuthWithPermission(request, ["tentang.update"]);
    const body = await request.json();
    const previous = await getAdminCollaborationContent();
    const collaboration = await upsertAdminCollaborationContent(body || {});

    const previousUrls = new Set(collectCollaborationImageUrls(previous).filter(isManagedUploadSource));
    const currentUrls = new Set(collectCollaborationImageUrls(collaboration));
    const staleUrls = [...previousUrls].filter((url) => !currentUrls.has(url));

    if (staleUrls.length > 0) {
      const uploads = new Uploads();
      await Promise.all(
        staleUrls.map(async (url) => {
          try {
            await uploads.deleteFile(url);
          } catch (deleteError) {
            logger.warn("Failed to delete stale collaboration image", {
              url,
              error: deleteError && (deleteError.stack || deleteError.message || deleteError),
            });
          }
        }),
      );
    }

    return respondSuccess({ collaboration }, 200);
  } catch (error) {
    logger.error("Error saving admin collaboration content", { error: error && (error.stack || error.message || error) });

    const prismaError = mapPrismaRouteError(error);
    if (prismaError) return respondError(prismaError);

    if (error instanceof AppError) return respondError(error);
    return respondError(new AppError("Failed to save collaboration content", 500));
  }
}

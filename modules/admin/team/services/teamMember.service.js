import { AppError } from "@/lib/response";
import logger from "../../../../lib/logger.js";
import Uploads from "../../../../lib/upload/uploads.js";
import { createWithUpload, updateWithUpload } from "../../../../lib/upload/transactionalUpload.js";
import * as teamMemberRepository from "../repositories/teamMember.repository.js";
import * as teamCategoryRepository from "../repositories/teamCategory.repository.js";
import { createTeamMemberSchema, updateTeamMemberSchema, validateTeamMemberData } from "../validators/teamMember.validator.js";

const toSlug = (value) => {
  const base = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "item";
};

const normalizeTeamMemberPayload = (data) => {
  const payload = { ...data };
  delete payload.type;
  if (!payload.slug && payload.name) {
    payload.slug = toSlug(payload.name);
  }
  return payload;
};

const looksLikeManagedUpload = (source) => {
  if (!source || typeof source !== "string") return false;
  const normalized = source.replace(/\\/g, "/");
  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/") || normalized.includes("/uploads/")) return true;
  if (normalized.startsWith("/public/uploads/") || normalized.startsWith("public/uploads/") || normalized.includes("/public/uploads/")) return true;
  if (process.env.S3_PUBLIC_URL) {
    const normalized = process.env.S3_PUBLIC_URL.replace(/\/$/, "");
    if (source.startsWith(normalized)) return true;
  }
  if (/s3\.amazonaws\.com/.test(source) || /s3[.-]/.test(source)) return true;
  return false;
};

const normalizeUploadSourceForDeletion = (source) => {
  if (!source || typeof source !== "string") return source;
  const normalized = source.replace(/\\/g, "/");
  if (normalized.startsWith("/public/uploads/")) return normalized.replace(/^\/public\//, "/");
  if (normalized.startsWith("public/uploads/")) return normalized.replace(/^public\//, "");
  if (normalized.includes("/public/uploads/")) {
    const idx = normalized.indexOf("/public/uploads/");
    return normalized.slice(idx + "/public".length);
  }
  if (source.startsWith("/uploads/") || source.startsWith("uploads/")) return source;
  try {
    const parsed = new URL(source);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    if (parsed.pathname.startsWith("/public/uploads/")) {
      return parsed.pathname.replace(/^\/public\//, "/");
    }
  } catch (err) {
    // fall back to raw source when parsing fails
  }
  return source;
};

function rethrowZodAsAppError(error) {
  // zod uses error.errors or error.issues
  const issues = error?.issues || error?.errors;
  if (Array.isArray(issues) && issues.length > 0) {
    const msg = issues.map((i) => i?.message || JSON.stringify(i)).join(", ");
    throw new AppError(msg, 400, "VALIDATION_ERROR");
  }
  throw error;
}

export async function getTeamMemberById(id) {
  const member = await teamMemberRepository.findTeamMemberById(id);
  if (!member) {
    throw new AppError("Team member not found", 404);
  }
  return member;
}

export async function createTeamMember(data) {
  const payload = normalizeTeamMemberPayload(data);

  let validatedData;
  try {
    validatedData = validateTeamMemberData(payload, createTeamMemberSchema);
  } catch (error) {
    logger.warn("Create Team member validation failed", { payload, error: error.errors });
    rethrowZodAsAppError(error);
  }

  const category = await teamCategoryRepository.findTeamCategoryById(validatedData.categoryId);
  if (!category) {
    throw new AppError("Team category not found", 404);
  }

  if (validatedData.order === undefined || validatedData.order === null) {
    const maxOrder = await teamMemberRepository.getMaxTeamMemberOrder(validatedData.categoryId);
    validatedData.order = maxOrder + 1;
  }

  const existing = await teamMemberRepository.findTeamMemberBySlugName(validatedData.slug, validatedData.name);
  if (existing) {
    throw new AppError("Team member with this slug and name already exists", 400);
  }

  try {
    const member = await teamMemberRepository.createTeamMember(validatedData);
    logger.info("Team member created", { memberId: member.id, categoryId: member.categoryId });
    return member;
  } catch (error) {
    logger.error("Error creating team member", { error: error.message });
    throw new AppError("Failed to create team member", 500);
  }
}

export async function createTeamMemberWithFile(data, file) {
  const payload = normalizeTeamMemberPayload(data);
  const schema = createTeamMemberSchema.omit({ imageUrl: true });
  let validatedData;
  try {
    validatedData = validateTeamMemberData(payload, schema);
  } catch (error) {
    logger.warn("Team member validation failed (with file)", { payload, error: error.errors });
    rethrowZodAsAppError(error);
  }

  const category = await teamCategoryRepository.findTeamCategoryById(validatedData.categoryId);
  if (!category) {
    throw new AppError("Team category not found", 404);
  }

  if (validatedData.order === undefined || validatedData.order === null) {
    const maxOrder = await teamMemberRepository.getMaxTeamMemberOrder(validatedData.categoryId);
    validatedData.order = maxOrder + 1;
  }

  const existing = await teamMemberRepository.findTeamMemberBySlugName(validatedData.slug, validatedData.name);
  if (existing) {
    throw new AppError("Team member with this slug and name already exists", 400);
  }

  const uploads = new Uploads();

  try {
    const member = await createWithUpload(
      {
        createRecord: async () => teamMemberRepository.createTeamMember(validatedData),
        uploadFile: async (filePayload) => uploads.handleUpload(filePayload),
        updateSource: async (id, url) => teamMemberRepository.updateTeamMember(id, { imageUrl: url }),
        deleteRecord: async (id) => teamMemberRepository.deleteTeamMember(id),
      },
      file,
    );
    logger.info("Team member created with upload", { memberId: member?.id, categoryId: member?.categoryId });
    return member;
  } catch (error) {
    logger.error("Error creating team member with file", { error: error && (error.stack || error.message) });
    throw error;
  }
}

export async function updateTeamMember(id, data) {
  // New implementation modeled after hero.service's updateHero
  const existingMember = await getTeamMemberById(id);

  // Validate input
  let validatedData;
  try {
    validatedData = validateTeamMemberData(data, updateTeamMemberSchema);
    logger.info("Team member update data validated", validatedData);
  } catch (error) {
    logger.warn("Team member update validation failed", { memberId: id, error: error.errors });
    rethrowZodAsAppError(error);
  }

  // Remove undefined fields
  let updateData = Object.fromEntries(Object.entries(validatedData).filter(([_, value]) => value !== undefined));

  const hasImageField = Object.prototype.hasOwnProperty.call(data, "imageUrl");
  const shouldClearImage = hasImageField && (data.imageUrl === "" || data.imageUrl === null);

  if (shouldClearImage) {
    try {
      const uploads = new Uploads();
      const oldSource = existingMember && existingMember.imageUrl ? String(existingMember.imageUrl) : null;
      if (oldSource && looksLikeManagedUpload(oldSource)) {
        try {
          await uploads.deleteFile(oldSource);
          logger.info("Deleted atas previous team member upload during pre-update cleanup", { memberId: id, deletedSource: oldSource });
        } catch (err) {
          logger.warn("Failed to delete previous team member upload during pre-update cleanup", { memberId: id, deletedSource: oldSource, error: err && err.message });
        }
      }
    } catch (err) {
      logger.warn("Could not perform pre-update uploaded-file cleanup", { memberId: id, error: err && err.message });
    }

    // Ensure we explicitly clear the image reference in the DB
    updateData = { ...updateData, imageUrl: "" };
    logger.info("Clearing imageUrl in updateData", { updateData });
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  logger.info("Updating team member", { memberId: id, updateData: Object.keys(updateData) });

  try {
    const member = await teamMemberRepository.updateTeamMember(id, updateData);
    logger.info("Team member updated successfully", { memberId: id, updatedFields: Object.keys(updateData) });
    return member;
  } catch (error) {
    logger.error("Error updating team member", { memberId: id, error: error.message });
    throw new AppError("Failed to update team member", 500);
  }
}

export async function reorderTeamMembers(items = []) {
  if (!Array.isArray(items)) {
    throw new AppError("Invalid reorder payload", 400);
  }

  const normalized = items.map((item) => {
    const id = Number(item.id);
    const order = Number(item.order);
    const categoryId = Number(item.categoryId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new AppError("Invalid team member id", 400);
    }
    if (!Number.isFinite(order) || order < 0) {
      throw new AppError("Invalid team member order", 400);
    }
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      throw new AppError("Invalid team member category", 400);
    }
    return { id, order, categoryId };
  });

  try {
    await teamMemberRepository.updateTeamMemberOrders(normalized);
    logger.info("Team member order updated", { count: normalized.length });
    return { count: normalized.length };
  } catch (error) {
    logger.error("Error reordering team members", { error: error.message });
    throw new AppError("Failed to reorder team members", 500);
  }
}

export async function updateTeamMemberWithFile(id, data, file) {
  const existingMember = await getTeamMemberById(id);
  const payload = normalizeTeamMemberPayload(data);

  let validatedData;
  try {
    validatedData = validateTeamMemberData(payload, updateTeamMemberSchema);
  } catch (error) {
    logger.warn("Team member update validation failed (with file)", { memberId: id, error: error.errors });
    rethrowZodAsAppError(error);
  }

  const nextName = validatedData.name ?? existingMember.name;
  const nextSlug = validatedData.slug ?? existingMember.slug;
  if (nextName && nextSlug) {
    const conflict = await teamMemberRepository.findTeamMemberBySlugName(nextSlug, nextName);
    if (conflict && conflict.id !== id) {
      throw new AppError("Team member with this slug and name already exists", 400);
    }
  }

  if (validatedData.categoryId) {
    const category = await teamCategoryRepository.findTeamCategoryById(validatedData.categoryId);
    if (!category) {
      throw new AppError("Team category not found", 404);
    }
  }

  const updateData = Object.fromEntries(Object.entries(validatedData).filter(([_, value]) => value !== undefined));
  delete updateData.imageUrl;

  const uploads = new Uploads();
  const snapshot = { ...existingMember, source: existingMember.imageUrl };

  try {
    const member = await updateWithUpload(
      {
        getExisting: async () => snapshot,
        updateRecord: async (recordId, dataToUpdate) => teamMemberRepository.updateTeamMember(recordId, dataToUpdate),
        uploadFile: async (filePayload) => uploads.handleUpload(filePayload),
        updateSource: async (recordId, url) => teamMemberRepository.updateTeamMember(recordId, { imageUrl: url }),
        revertRecord: async (recordId, prev) => {
          await teamMemberRepository.updateTeamMember(recordId, {
            categoryId: prev.categoryId,
            name: prev.name,
            slug: prev.slug,
            role: prev.role,
            imageUrl: prev.imageUrl,
            email: prev.email,
            instagram: prev.instagram,
            order: prev.order,
            isActive: prev.isActive,
          });
        },
        deleteFile: async (oldSource) => {
          if (!looksLikeManagedUpload(oldSource)) return;
          try {
            await uploads.deleteFile(oldSource);
          } catch (err) {
            logger.warn("Failed to delete previous team member upload", {
              memberId: id,
              oldSource,
              error: err && (err.message || err.stack),
            });
          }
        },
      },
      id,
      updateData,
      file,
    );
    logger.info("Team member updated with file", { memberId: id });
    return member;
  } catch (error) {
    logger.error("Error updating team member with file", {
      memberId: id,
      error: error && (error.stack || error.message),
    });
    throw error;
  }
}

export async function deleteTeamMember(id) {
  logger.info("deleteTeamMember called", { memberId: id });
  // Check if team member exists
  await getTeamMemberById(id);

  try {
    // Attempt to delete associated file if any
    try {
      const member = await teamMemberRepository.findTeamMemberById(id);
      logger.info("Lookup team member media before delete", { memberId: id, source: member.imageUrl });
      if (member && member.imageUrl) {
        logger.info("Found team member media to delete", { memberId: id, source: member.imageUrl });
        const uploads = new Uploads();
        try {
          await uploads.deleteFile(member.imageUrl);
          logger.info("Deleted team member media file", { memberId: id, source: member.imageUrl });
        } catch (err) {
          logger.info("Failed to delete team member media file, continuing with DB delete", { memberId: id, source: member.imageUrl, error: err.message });
        }
      }
    } catch (err) {
      logger.info("Could not lookup team member media before delete", { memberId: id, error: err.message });
    }

    await teamMemberRepository.deleteTeamMember(id);
    logger.info("Team member deleted successfully", { memberId: id });
  } catch (error) {
    logger.error("Error deleting team member", { memberId: id, error: error.message });
    throw new AppError("Failed to delete team member", 500);
  }
}
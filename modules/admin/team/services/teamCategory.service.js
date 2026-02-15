import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import * as teamCategoryRepository from "../repositories/teamCategory.repository.js";
import { createTeamCategorySchema, updateTeamCategorySchema, validateTeamCategoryData } from "../validators/teamCategory.validator.js";

const toSlug = (value) => {
  const base = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "item";
};

export async function getTeamCategories(options = {}) {
  try {
    return await teamCategoryRepository.findAllTeamCategories(options);
  } catch (error) {
    logger.error("Error in getTeamCategories service", { error: error.message });
    throw new AppError("Failed to fetch team categories", 500);
  }
}

export async function getTeamCategoriesWithMembers(options = {}) {
  try {
    return await teamCategoryRepository.findTeamCategoriesWithMembers(options);
  } catch (error) {
    logger.error("Error in getTeamCategoriesWithMembers service", { error: error.message });
    throw new AppError("Failed to fetch team categories", 500);
  }
}

export async function getTeamCategoryById(id) {
  const category = await teamCategoryRepository.findTeamCategoryById(id);
  if (!category) {
    throw new AppError("Team category not found", 404);
  }
  return category;
}

export async function createTeamCategory(data) {
  const payload = { ...data };
  delete payload.type;
  if (!payload.slug && payload.name) {
    payload.slug = toSlug(payload.name);
  }
  if (payload.order === undefined || payload.order === null) {
    const maxOrder = await teamCategoryRepository.getMaxTeamCategoryOrder();
    payload.order = maxOrder + 1;
  }

  let validatedData;
  try {
    validatedData = validateTeamCategoryData(payload, createTeamCategorySchema);
  } catch (error) {
    logger.warn("Team category validation failed", { payload, error: error.errors });
    throw new AppError(error.errors?.[0]?.message || "Invalid team category data", 400, "VALIDATION_ERROR");
  }

  const existing = await teamCategoryRepository.findTeamCategoryBySlugName(validatedData.slug, validatedData.name);
  if (existing) {
    throw new AppError("Team category with this slug and name already exists", 400);
  }

  try {
    const category = await teamCategoryRepository.createTeamCategory(validatedData);
    logger.info("Team category created", { categoryId: category.id });
    return category;
  } catch (error) {
    logger.error("Error creating team category", { error: error.message });
    throw new AppError("Failed to create team category", 500);
  }
}

export async function reorderTeamCategories(items = []) {
  if (!Array.isArray(items)) {
    throw new AppError("Invalid reorder payload", 400);
  }

  const normalized = items.map((item) => {
    const id = Number(item.id);
    const order = Number(item.order);
    if (!Number.isFinite(id) || id <= 0) {
      throw new AppError("Invalid team category id", 400);
    }
    if (!Number.isFinite(order) || order < 0) {
      throw new AppError("Invalid team category order", 400);
    }
    return { id, order };
  });

  try {
    await teamCategoryRepository.updateTeamCategoryOrders(normalized);
    logger.info("Team category order updated", { count: normalized.length });
    return { count: normalized.length };
  } catch (error) {
    logger.error("Error reordering team categories", { error: error.message });
    throw new AppError("Failed to reorder team categories", 500);
  }
}

export async function updateTeamCategory(id, data) {
  const existingCategory = await getTeamCategoryById(id);

  const payload = { ...data };
  delete payload.type;
  if (!payload.slug && payload.name) {
    payload.slug = toSlug(payload.name);
  }

  let validatedData;
  try {
    validatedData = validateTeamCategoryData(payload, updateTeamCategorySchema);
  } catch (error) {
    logger.warn("Team category update validation failed", { categoryId: id, error: error.errors });
    throw new AppError(error.errors?.[0]?.message || "Invalid team category data", 400, "VALIDATION_ERROR");
  }

  const updatedName = validatedData.name ?? existingCategory.name;
  const updatedSlug = validatedData.slug ?? existingCategory.slug;
  if (updatedName && updatedSlug) {
    const conflict = await teamCategoryRepository.findTeamCategoryBySlugName(updatedSlug, updatedName);
    if (conflict && conflict.id !== id) {
      throw new AppError("Team category with this slug and name already exists", 400);
    }
  }

  try {
    const category = await teamCategoryRepository.updateTeamCategory(id, validatedData);
    logger.info("Team category updated", { categoryId: id, changes: Object.keys(validatedData) });
    return category;
  } catch (error) {
    logger.error("Error updating team category", { categoryId: id, error: error.message });
    throw new AppError("Failed to update team category", 500);
  }
}

export async function deleteTeamCategory(id) {
  await getTeamCategoryById(id);

  try {
    await teamCategoryRepository.deleteTeamCategory(id);
    logger.info("Team category deleted", { categoryId: id });
    return { message: "Team category deleted successfully" };
  } catch (error) {
    logger.error("Error deleting team category", { categoryId: id, error: error.message });
    throw new AppError("Failed to delete team category", 500);
  }
}

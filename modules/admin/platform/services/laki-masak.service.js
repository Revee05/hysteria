import { AppError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import * as repo from '../repositories/laki-masak.repository.js';
import {
  validateLakiMasakData,
  updatePreOrderSchema,
} from '../validators/laki-masak.validator.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getItem(finder, label) {
  const item = await finder();
  if (!item) throw new AppError(`${label} item not found`, 404);
  return item;
}

async function updateItem(finder, label, payload, schema) {
  let validated;
  try {
    validated = validateLakiMasakData(payload, schema);
  } catch (err) {
    logger.warn(`${label} validation failed`, { error: err.errors || err.message });
    throw new AppError(err.errors?.[0]?.message || 'Invalid input', 400, 'VALIDATION_ERROR');
  }

  const existing = await finder();
  if (!existing) throw new AppError(`${label} item not found`, 404);

  const targetCategoryId = validated.categoryId ?? existing.categoryId;
  if (validated.parentId !== undefined && validated.parentId !== null) {
    const parent = await repo.findItemById(validated.parentId);
    if (!parent) throw new AppError('Parent item not found', 400);
    if (parent.categoryId !== targetCategoryId)
      throw new AppError('Parent item does not belong to target category', 400);
    if (parent.id === existing.id)
      throw new AppError('Cannot set item as its own parent', 400);
  }

  try {
    const updated = await repo.updateItem(existing.id, validated);
    logger.info(`${label} updated`, { id: updated.id });
    return updated;
  } catch (err) {
    logger.error(`Error updating ${label}`, { error: err.message });
    throw new AppError(`Failed to update ${label}`, 500);
  }
}

// ── Pre-Order ─────────────────────────────────────────────────────────────────

export async function getPreOrder() {
  return getItem(repo.findPreOrder, 'Pre-Order');
}

export async function updatePreOrder(payload) {
  return updateItem(repo.findPreOrder, 'Pre-Order', payload, updatePreOrderSchema);
}

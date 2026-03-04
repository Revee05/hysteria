import { AppError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import * as repo from '../repositories/link.repository.js';
import { validateMerchandiseData, updateMerchandiseSchema } from '../validators/link.validator.js';

/**
 * Get merch item
 */
export async function getMerchandise() {
  const item = await repo.findMerchItem();
  if (!item) {
    throw new AppError('Merchandise item not found', 404);
  }
  return item;
}

/**
 * Update merch item with strong validation
 */
export async function updateMerchandise(payload) {
  // validate input
  let validated;
  try {
    validated = validateMerchandiseData(payload, updateMerchandiseSchema);
  } catch (err) {
    logger.warn('Merchandise validation failed', { error: err.errors || err.message });
    throw new AppError(err.errors?.[0]?.message || 'Invalid input', 400, 'VALIDATION_ERROR');
  }

  const existing = await repo.findMerchItem();
  if (!existing) {
    throw new AppError('Merchandise item not found', 404);
  }

  // If parentId provided, verify it exists and belongs to target category
  const targetCategoryId = validated.categoryId ?? existing.categoryId;
  if (validated.parentId !== undefined && validated.parentId !== null) {
    const parent = await repo.findItemById(validated.parentId);
    if (!parent) throw new AppError('Parent item not found', 400);
    if (parent.categoryId !== targetCategoryId) throw new AppError('Parent item does not belong to target category', 400);
    if (parent.id === existing.id) throw new AppError('Cannot set item as its own parent', 400);
  }

  try {
    const updated = await repo.updateMerchItem(existing.id, validated);
    logger.info('Merchandise updated', { id: updated.id });
    return updated;
  } catch (err) {
    logger.error('Error updating merchandise', { error: err.message });
    throw new AppError('Failed to update merchandise', 500);
  }
}

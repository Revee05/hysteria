import { AppError } from '@/lib/response.js';
import logger from '@/lib/logger.js';
import * as repo from '../repositories/ditampart.repository.js';
import {
  validateDitampartData,
  update3DSchema,
  updateFotoKegiatanSchema,
  updateShortFilmDokumenterSchema,
} from '../validators/ditampart.validator.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getItem(finder, label) {
  const item = await finder();
  if (!item) throw new AppError(`${label} item not found`, 404);
  return item;
}

async function updateItem(finder, label, payload, schema) {
  let validated;
  try {
    validated = validateDitampartData(payload, schema);
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

// ── 3D ───────────────────────────────────────────────────────────────────────

export async function get3D() {
  return getItem(repo.find3D, '3D');
}

export async function update3D(payload) {
  return updateItem(repo.find3D, '3D', payload, update3DSchema);
}

// ── Foto Kegiatan ─────────────────────────────────────────────────────────────

export async function getFotoKegiatan() {
  return getItem(repo.findFotoKegiatan, 'Foto Kegiatan');
}

export async function updateFotoKegiatan(payload) {
  return updateItem(repo.findFotoKegiatan, 'Foto Kegiatan', payload, updateFotoKegiatanSchema);
}

// ── Short Film Dokumenter ─────────────────────────────────────────────────────

export async function getShortFilmDokumenter() {
  return getItem(repo.findShortFilmDokumenter, 'Short Film Dokumenter');
}

export async function updateShortFilmDokumenter(payload) {
  return updateItem(
    repo.findShortFilmDokumenter,
    'Short Film Dokumenter',
    payload,
    updateShortFilmDokumenterSchema,
  );
}

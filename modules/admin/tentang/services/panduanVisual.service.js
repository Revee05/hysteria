import { AppError } from "../../../../lib/response.js";
import * as panduanRepository from "../repositories/panduanVisual.repository.js";
import { validateCreatePanduanVisualData, validateUpdatePanduanVisualData } from "../validators/panduanVisual.validator.js";

export async function getPanduanVisualItems(options = {}) {
  return panduanRepository.findPanduanVisualItems(options);
}

export async function getPanduanVisualById(id) {
  const item = await panduanRepository.findPanduanVisualById(id);
  if (!item) throw new AppError("Panduan visual item not found", 404);
  return item;
}

export async function createPanduanVisual(data) {
  let payload;
  try {
    payload = validateCreatePanduanVisualData(data);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid panduan visual data", 400, "VALIDATION_ERROR");
  }

  if (payload.order === undefined || payload.order === null) {
    const maxOrder = await panduanRepository.findMaxPanduanVisualOrder();
    payload.order = maxOrder + 1;
  }

  return panduanRepository.createPanduanVisual(payload);
}

export async function updatePanduanVisual(id, data) {
  await getPanduanVisualById(id);

  let validated;
  try {
    validated = validateUpdatePanduanVisualData(data);
  } catch (error) {
    throw new AppError(error?.errors?.[0]?.message || error?.issues?.[0]?.message || "Invalid panduan visual data", 400, "VALIDATION_ERROR");
  }

  const payload = Object.fromEntries(Object.entries(validated).filter(([, value]) => value !== undefined));
  if (Object.keys(payload).length === 0) throw new AppError("No valid fields to update", 400);

  return panduanRepository.updatePanduanVisual(id, payload);
}

export async function deletePanduanVisual(id) {
  await getPanduanVisualById(id);
  await panduanRepository.deletePanduanVisual(id);
  return { message: "Panduan visual item deleted successfully" };
}

export async function reorderPanduanVisualItems(items = []) {
  if (!Array.isArray(items)) throw new AppError("Invalid reorder payload", 400);

  const normalized = items.map((item) => {
    const id = Number(item.id);
    const order = Number(item.order);
    if (!Number.isFinite(id) || id <= 0) throw new AppError("Invalid panduan visual id", 400);
    if (!Number.isFinite(order) || order < 0) throw new AppError("Invalid panduan visual order", 400);
    return { id, order };
  });

  await panduanRepository.updatePanduanVisualOrders(normalized);
  return { count: normalized.length };
}

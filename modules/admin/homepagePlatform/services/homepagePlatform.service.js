import { AppError } from "../../../../lib/response.js";
import { findHomepagePlatformCards, replaceHomepagePlatformCards } from "../repositories/homepagePlatform.repository.js";
import { validateHomepagePlatformPayload } from "../validators/homepagePlatform.validator.js";

function toAdminCard(card) {
  return {
    id: card.id,
    title: card.title || "",
    imageUrl: card.imageUrl || "",
    linkUrl: card.linkUrl || "",
    slotType: card.slotType,
    order: card.order,
    isActive: card.isActive,
  };
}

function assertCardConstraints(cards) {
  const activeCards = cards.filter((card) => card.isActive);
  if (activeCards.length !== 5) {
    throw new AppError("Harus ada tepat 5 kartu aktif", 400, "VALIDATION_ERROR");
  }

  const tallCount = activeCards.filter((card) => card.slotType === "tall").length;
  const shortCount = activeCards.filter((card) => card.slotType === "short").length;

  if (tallCount !== 3 || shortCount !== 2) {
    throw new AppError("Komposisi kartu harus 3 Tall dan 2 Short", 400, "VALIDATION_ERROR");
  }

  const titles = activeCards.map((card) => String(card.title || "").trim());
  if (new Set(titles).size !== titles.length) {
    throw new AppError("Judul kartu tidak boleh duplikat", 400, "VALIDATION_ERROR");
  }

  const orders = activeCards.map((card) => card.order);
  if (new Set(orders).size !== orders.length) {
    throw new AppError("Order kartu tidak boleh duplikat", 400, "VALIDATION_ERROR");
  }
}

export async function getHomepagePlatformSettings() {
  return {
    cards: (await findHomepagePlatformCards()).map(toAdminCard),
  };
}

export async function saveHomepagePlatformSettings(payload) {
  let validated;
  try {
    validated = validateHomepagePlatformPayload(payload);
  } catch (error) {
    throw new AppError(error.errors?.[0]?.message || "Payload tidak valid", 400, "VALIDATION_ERROR");
  }

  assertCardConstraints(validated.cards);

  const saved = await replaceHomepagePlatformCards(
    validated.cards.map((card) => ({
      title: card.title,
      imageUrl: card.imageUrl,
      linkUrl: card.linkUrl,
      slotType: card.slotType,
      order: card.order,
      isActive: card.isActive,
    })),
  );

  return saved.map(toAdminCard);
}

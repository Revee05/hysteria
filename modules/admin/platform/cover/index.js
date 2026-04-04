/**
 * Platform Cover submodule
 * Handles cover images (type="cover") for platform pages.
 *
 * Export:
 * - getCoverImage, listCoverImages, updateCoverImage, updateCoverImageWithFile (from cover.service.js)
 * - updateCoverSchema, validateCoverData (from cover.validator.js)
 */

export * from "./services/cover.service.js";
export * from "./validators/cover.validator.js";

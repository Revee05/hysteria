/**
 * Page Hero module
 */

import * as pageHeroService from "./services/pageHero.service.js";

export * from "./services/pageHero.service.js";
export * from "./repositories/pageHero.repository.js";
export * from "./validators/pageHero.validator.js";

export const getPageHeroBySlug = pageHeroService.getPageHeroBySlug;
export const upsertPageHeroBySlug = pageHeroService.upsertPageHeroBySlug;
export const upsertPageHeroWithFile = pageHeroService.upsertPageHeroWithFile;

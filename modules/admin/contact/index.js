import * as contactService from "./services/contact.service.js";

export * from "./repositories/contact.repository.js";
export * from "./services/contact.service.js";
export * from "./validators/contact.validator.js";

export const getPublicContactSection = contactService.getPublicContactSection;
export const getAdminContactSection = contactService.getAdminContactSection;
export const upsertAdminContactSection = contactService.upsertAdminContactSection;

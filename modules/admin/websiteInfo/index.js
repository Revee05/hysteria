import * as websiteInfoService from "./services/websiteInfo.service.js";

export * from "./repositories/websiteInfo.repository.js";
export * from "./services/websiteInfo.service.js";
export * from "./validators/websiteInfo.validator.js";

export const getPublicWebsiteInfo = websiteInfoService.getPublicWebsiteInfo;
export const getAdminWebsiteInfo = websiteInfoService.getAdminWebsiteInfo;
export const upsertAdminWebsiteInfo = websiteInfoService.upsertAdminWebsiteInfo;

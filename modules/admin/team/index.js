/**
 * Team module
 */

import * as teamCategoryService from "./services/teamCategory.service.js";
import * as teamMemberService from "./services/teamMember.service.js";

export * from "./services/teamCategory.service.js";
export * from "./services/teamMember.service.js";
export * from "./services/teamPublic.service.js";

export * from "./repositories/teamCategory.repository.js";
export * from "./repositories/teamMember.repository.js";

export * from "./validators/teamCategory.validator.js";
export * from "./validators/teamMember.validator.js";

export const getTeamCategoryById = teamCategoryService.getTeamCategoryById;
export const updateTeamCategory = teamCategoryService.updateTeamCategory;
export const deleteTeamCategory = teamCategoryService.deleteTeamCategory;
export const reorderTeamCategories = teamCategoryService.reorderTeamCategories;

export const getTeamMemberById = teamMemberService.getTeamMemberById;
export const createTeamMember = teamMemberService.createTeamMember;
export const createTeamMemberWithFile = teamMemberService.createTeamMemberWithFile;
export const updateTeamMember = teamMemberService.updateTeamMember;
export const updateTeamMemberWithFile = teamMemberService.updateTeamMemberWithFile;
export const deleteTeamMember = teamMemberService.deleteTeamMember;
export const reorderTeamMembers = teamMemberService.reorderTeamMembers;

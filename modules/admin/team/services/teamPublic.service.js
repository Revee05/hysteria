import { AppError } from "../../../../lib/response.js";
import logger from "../../../../lib/logger.js";
import * as teamCategoryRepository from "../repositories/teamCategory.repository.js";

export async function getActiveTeamCategoriesWithMembers() {
  try {
    const result = await teamCategoryRepository.findTeamCategoriesWithMembers({
      isActive: true,
      memberIsActive: true,
      perPage: 200,
    });

    const categories = result.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      isActive: cat.isActive,
      members: (cat.members || []).map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        role: m.role,
        imageUrl: m.imageUrl,
        email: m.email,
        instagram: m.instagram,
        order: m.order,
        isActive: m.isActive,
        categoryId: m.categoryId,
      })),
    }));

    return categories;
  } catch (error) {
    logger.error("Error in getActiveTeamCategoriesWithMembers service", { error: error.message });
    throw new AppError("Failed to fetch team data", 500);
  }
}

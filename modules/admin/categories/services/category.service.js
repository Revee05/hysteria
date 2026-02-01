import { AppError } from '../../../../lib/response.js';
import * as categoryRepository from '../repositories/category.repository.js';
import { validateCategoryData, createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import logger from '../../../../lib/logger.js';

/**
 * Get all categories
 * @param {Object} options - Query options
 * @param {boolean|null} options.isActive - Filter by active status
 * @returns {Promise<Array>}
 */
export async function getAllCategories(options = {}) {
  try {
    const categories = await categoryRepository.findAllCategories(options);
    return categories;
  } catch (error) {
    logger.error('Error in getAllCategories service', { error: error.message });
    throw new AppError('Failed to fetch categories', 500);
  }
}

/**
 * Get category by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getCategoryById(id) {
  const category = await categoryRepository.findCategoryById(id);
  
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  
  return category;
}

/**
 * Create new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>}
 */
export async function createCategory(data) {
  // Validate input
  let validatedData;
  try {
    validatedData = validateCategoryData(data, createCategorySchema);
  } catch (error) {
    logger.warn('Category validation failed', { payload: data, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid category data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Check slug uniqueness
  const existingSlug = await categoryRepository.findCategoryBySlug(validatedData.slug);
  if (existingSlug) {
    throw new AppError('Category with this slug already exists', 400);
  }

  try {
    const category = await categoryRepository.createCategory(validatedData);
    logger.info('Category created successfully', { categoryId: category.id, slug: category.slug });
    return category;
  } catch (error) {
    logger.error('Error creating category', { error: error.message });
    throw new AppError('Failed to create category', 500);
  }
}

/**
 * Update category
 * @param {number} id
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>}
 */
export async function updateCategory(id, data) {
  // Check if category exists
  const existingCategory = await getCategoryById(id);

  // Validate input
  let validatedData;
  try {
    validatedData = validateCategoryData(data, updateCategorySchema);
  } catch (error) {
    logger.warn('Category update validation failed', { categoryId: id, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid category data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Check slug uniqueness if changed
  if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
    const existingSlug = await categoryRepository.findCategoryBySlug(validatedData.slug);
    if (existingSlug) {
      throw new AppError('Category with this slug already exists', 400);
    }
  }

  try {
    const category = await categoryRepository.updateCategory(id, validatedData);
    logger.info('Category updated successfully', { categoryId: id, changes: Object.keys(validatedData) });
    return category;
  } catch (error) {
    logger.error('Error updating category', { categoryId: id, error: error.message });
    throw new AppError('Failed to update category', 500);
  }
}

/**
 * Delete category
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteCategory(id) {
  // Check if category exists
  const existingCategory = await getCategoryById(id);

  try {
    await categoryRepository.deleteCategory(id);
    logger.info('Category deleted successfully', { 
      categoryId: id, 
      slug: existingCategory.slug,
      itemsDeleted: existingCategory._count?.items || 0
    });
    return {
      message: 'Category deleted successfully',
      deletedItems: existingCategory._count?.items || 0
    };
  } catch (error) {
    logger.error('Error deleting category', { categoryId: id, error: error.message });
    throw new AppError('Failed to delete category', 500);
  }
}

/**
 * Format category response
 * @param {Object} category
 * @returns {Object}
 */
export function formatCategoryResponse(category) {
  return {
    id: category.id,
    title: category.title,
    slug: category.slug,
    description: category.description,
    order: category.order,
    isActive: category.isActive,
    requiredPermissionId: category.requiredPermissionId,
    itemCount: category._count?.items || 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

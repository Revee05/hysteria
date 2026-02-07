import { AppError } from '../../../../lib/response.js';
import * as categoryItemsRepository from '../repositories/categoryItems.repository.js';
import * as categoryRepository from '../repositories/category.repository.js';
import { validateCategoryItemData, createCategoryItemSchema, updateCategoryItemSchema, reorderItemsSchema } from '../validators/categoryItems.validator.js';
import logger from '../../../../lib/logger.js';
import { buildTreeFromPrisma } from '../../../../lib/helper/tree.helper.js';

/**
 * Get all items for a category in tree structure
 * @param {number} categoryId
 * @param {number} depth - Tree depth (default: 4)
 * @returns {Promise<Object>}
 */
export async function getCategoryItemsTree(categoryId, depth = 4) {
  // Verify category exists
  const category = await categoryRepository.findCategoryById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  try {
    const items = await categoryItemsRepository.findItemsTree(categoryId, depth);
    const tree = buildTreeFromPrisma(items);

    return {
      category: {
        id: category.id,
        title: category.title,
        slug: category.slug
      },
      items: tree,
      totalItems: items.length
    };
  } catch (error) {
    logger.error('Error fetching category items tree', { categoryId, error: error.message });
    throw new AppError('Failed to fetch category items', 500);
  }
}

/**
 * Get single category item by ID
 * @param {number} itemId
 * @param {number} categoryId
 * @returns {Promise<Object>}
 */
export async function getCategoryItemById(itemId, categoryId) {
  const item = await categoryItemsRepository.findItemById(itemId, categoryId);
  
  if (!item) {
    throw new AppError('Category item not found', 404);
  }
  
  return item;
}

/**
 * Create new category item
 * @param {number} categoryId
 * @param {Object} data - Item data
 * @returns {Promise<Object>}
 */
export async function createCategoryItem(categoryId, data) {
  // Verify category exists
  const category = await categoryRepository.findCategoryById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Validate input
  let validatedData;
  try {
    validatedData = validateCategoryItemData(data, createCategoryItemSchema);
  } catch (error) {
    logger.warn('Category item validation failed', { categoryId, payload: data, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid category item data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Verify parent exists if provided
  if (validatedData.parentId) {
    const parent = await categoryItemsRepository.findItemById(validatedData.parentId, categoryId);
    if (!parent) {
      throw new AppError('Parent item not found in this category', 400);
    }
  }

  try {
    const item = await categoryItemsRepository.createItem({
      ...validatedData,
      categoryId
    });
    logger.info('Category item created successfully', { categoryId, itemId: item.id });
    return item;
  } catch (error) {
    logger.error('Error creating category item', { categoryId, error: error.message });
    throw new AppError('Failed to create category item', 500);
  }
}

/**
 * Update category item
 * @param {number} itemId
 * @param {number} categoryId
 * @param {Object} data - Updated item data
 * @returns {Promise<Object>}
 */
export async function updateCategoryItem(itemId, categoryId, data) {
  // Check if item exists
  const existingItem = await getCategoryItemById(itemId, categoryId);

  // Validate input
  let validatedData;
  try {
    validatedData = validateCategoryItemData(data, updateCategoryItemSchema);
  } catch (error) {
    logger.warn('Category item update validation failed', { itemId, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid category item data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Check if new parent exists (if provided and changed)
  if (validatedData.parentId !== undefined && validatedData.parentId !== null && validatedData.parentId !== existingItem.parentId) {
    // Check circular reference
    if (validatedData.parentId === itemId) {
      throw new AppError('Cannot set item as its own parent', 400);
    }

    const parent = await categoryItemsRepository.findItemById(validatedData.parentId, categoryId);
    if (!parent) {
      throw new AppError('Parent item not found in this category', 400);
    }

    // TODO: Add recursive check for circular references in nested structures
  }

  try {
    const item = await categoryItemsRepository.updateItem(itemId, validatedData);
    logger.info('Category item updated successfully', { itemId, changes: Object.keys(validatedData) });
    return item;
  } catch (error) {
    logger.error('Error updating category item', { itemId, error: error.message });
    throw new AppError('Failed to update category item', 500);
  }
}

/**
 * Delete category item
 * @param {number} itemId
 * @param {number} categoryId
 * @returns {Promise<Object>}
 */
export async function deleteCategoryItem(itemId, categoryId) {
  // Check if item exists
  const existingItem = await getCategoryItemById(itemId, categoryId);

  try {
    await categoryItemsRepository.deleteItem(itemId);
    logger.info('Category item deleted successfully', { 
      itemId,
      title: existingItem.title,
      childrenDeleted: existingItem._count?.children || 0
    });
    return {
      message: 'Category item deleted successfully',
      deletedChildren: existingItem._count?.children || 0
    };
  } catch (error) {
    logger.error('Error deleting category item', { itemId, error: error.message });
    throw new AppError('Failed to delete category item', 500);
  }
}

/**
 * Bulk reorder category items
 * @param {number} categoryId
 * @param {Array<{id: number, order: number}>} items
 * @returns {Promise<Object>}
 */
export async function reorderCategoryItems(categoryId, items) {
  // Verify category exists
  const category = await categoryRepository.findCategoryById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Validate input
  let validatedData;
  try {
    validatedData = validateCategoryItemData({ items }, reorderItemsSchema);
  } catch (error) {
    logger.warn('Reorder items validation failed', { categoryId, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid reorder data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Verify all items belong to this category
  const itemIds = validatedData.items.map(item => item.id);
  const existingItems = await categoryItemsRepository.findItemsByIds(itemIds, categoryId);

  if (existingItems.length !== itemIds.length) {
    throw new AppError('Some items do not belong to this category', 400);
  }

  try {
    await categoryItemsRepository.bulkReorderItems(validatedData.items);
    logger.info('Category items reordered successfully', { categoryId, itemCount: validatedData.items.length });
    return {
      message: 'Items reordered successfully',
      updatedCount: validatedData.items.length
    };
  } catch (error) {
    logger.error('Error reordering category items', { categoryId, error: error.message });
    throw new AppError('Failed to reorder items', 500);
  }
}

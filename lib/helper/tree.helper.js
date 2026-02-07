/**
 * Tree Helper Functions
 * Utility untuk mengubah flat data menjadi nested tree structure
 */

/**
 * Build tree structure dari flat array items
 * @param {Array} items - Array of flat items with parentId
 * @param {Number|null} parentId - Parent ID untuk level saat ini
 * @returns {Array} Tree structure dengan children rekursif
 */
export function buildTree(items, parentId = null) {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }));
}

/**
 * Build tree dari Prisma CategoryItem query result
 * Mengubah format Prisma nested relations menjadi array tree
 * @param {Array} items - Array dari Prisma dengan nested children
 * @returns {Array} Tree structure yang sudah sorted
 */
export function buildTreeFromPrisma(items) {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  function processItem(item) {
    const processed = {
      id: item.id,
      title: item.title,
      slug: item.slug,
      url: item.url,
      order: item.order || 0,
      isActive: item.isActive,
      meta: item.meta,
      children: []
    };

    if (item.children && item.children.length > 0) {
      processed.children = item.children
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(child => processItem(child));
    }

    return processed;
  }

  return items
    .filter(item => !item.parentId) // Only root items
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => processItem(item));
}

/**
 * Flatten tree structure back to array
 * @param {Array} tree - Tree structure dengan children
 * @param {Number|null} parentId - Parent ID untuk inject
 * @returns {Array} Flat array dengan parentId
 */
export function flattenTree(tree, parentId = null) {
  if (!tree || !Array.isArray(tree)) {
    return [];
  }

  return tree.reduce((acc, item) => {
    const { children, ...itemWithoutChildren } = item;
    const flatItem = { ...itemWithoutChildren, parentId };
    
    acc.push(flatItem);
    
    if (children && children.length > 0) {
      acc.push(...flattenTree(children, item.id));
    }
    
    return acc;
  }, []);
}

/**
 * Find item by slug dalam tree
 * @param {Array} tree - Tree structure
 * @param {String} slug - Slug yang dicari
 * @returns {Object|null} Item yang ditemukan atau null
 */
export function findInTree(tree, slug) {
  if (!tree || !Array.isArray(tree) || !slug) {
    return null;
  }

  for (const item of tree) {
    if (item.slug === slug) {
      return item;
    }
    
    if (item.children && item.children.length > 0) {
      const found = findInTree(item.children, slug);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

/**
 * Get breadcrumb path untuk item tertentu
 * @param {Array} tree - Tree structure
 * @param {String} slug - Slug item yang dicari
 * @param {Array} path - Current path (untuk rekursi)
 * @returns {Array} Array of items dari root ke target
 */
export function getBreadcrumb(tree, slug, path = []) {
  if (!tree || !Array.isArray(tree) || !slug) {
    return [];
  }

  for (const item of tree) {
    const currentPath = [...path, { id: item.id, title: item.title, slug: item.slug, url: item.url }];
    
    if (item.slug === slug) {
      return currentPath;
    }
    
    if (item.children && item.children.length > 0) {
      const found = getBreadcrumb(item.children, slug, currentPath);
      if (found.length > 0) {
        return found;
      }
    }
  }
  
  return [];
}

/**
 * Filter tree berdasarkan kondisi (untuk permission filtering)
 * @param {Array} tree - Tree structure
 * @param {Function} filterFn - Function untuk filter (return true to keep)
 * @returns {Array} Filtered tree
 */
export function filterTree(tree, filterFn) {
  if (!tree || !Array.isArray(tree) || typeof filterFn !== 'function') {
    return [];
  }

  return tree
    .filter(filterFn)
    .map(item => ({
      ...item,
      children: item.children ? filterTree(item.children, filterFn) : []
    }));
}

/**
 * Count total items dalam tree (termasuk children)
 * @param {Array} tree - Tree structure
 * @returns {Number} Total count
 */
export function countTreeItems(tree) {
  if (!tree || !Array.isArray(tree)) {
    return 0;
  }

  return tree.reduce((count, item) => {
    return count + 1 + countTreeItems(item.children || []);
  }, 0);
}

/**
 * Get max depth dari tree
 * @param {Array} tree - Tree structure
 * @param {Number} currentDepth - Current depth level
 * @returns {Number} Max depth
 */
export function getMaxDepth(tree, currentDepth = 0) {
  if (!tree || !Array.isArray(tree) || tree.length === 0) {
    return currentDepth;
  }

  return Math.max(
    ...tree.map(item => 
      getMaxDepth(item.children || [], currentDepth + 1)
    )
  );
}

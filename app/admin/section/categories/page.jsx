"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../lib/context/auth-context';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../lib/api-client';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Tree Node Component dengan drag handle
function SortableTreeNode({ item, onEdit, onDelete, onAddChild, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-300 border-opacity-75 pl-4' : ''}`}
    >
      <div className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        
        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        {/* Item info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden="true" />
            <span className="font-medium text-gray-900">{item.title}</span>
            {!item.isActive && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inactive</span>
            )}
          </div>
          {item.url && (
            <div className="text-sm text-gray-500">{item.url}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddChild(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded text-sm"
            title="Add child item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-green-600 hover:bg-green-50 rounded text-sm"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded text-sm"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Render children */}
      {expanded && hasChildren && (
        <div className="mt-1">
          {item.children.map(child => (
            <SortableTreeNode
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Modal untuk Add/Edit Category
function CategoryModal({ isOpen, onClose, onSave, category, mode }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    let timer;
    if (category) {
      timer = setTimeout(() => {
        setFormData({
          title: category.title || '',
          slug: category.slug || '',
          description: category.description || '',
          order: category.order || 0,
          isActive: category.isActive !== undefined ? category.isActive : true
        });
      }, 0);
    } else {
      timer = setTimeout(() => {
        setFormData({
          title: '',
          slug: '',
          description: '',
          order: 0,
          isActive: true
        });
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {category ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="auto-generated from title if empty"
              />
              <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (e.g., &quot;program-hysteria&quot;)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Optional description for this category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="categoryIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="categoryIsActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                {category ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal untuk Add/Edit Item
function ItemModal({ isOpen, onClose, onSave, item, categoryId, allItems }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    url: '',
    parentId: null,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    let timer;
    if (item) {
      timer = setTimeout(() => {
        setFormData({
          title: item.title || '',
          slug: item.slug || '',
          url: item.url || '',
          parentId: item.parentId || null,
          order: item.order || 0,
          isActive: item.isActive !== undefined ? item.isActive : true
        });
      }, 0);
    } else {
      timer = setTimeout(() => {
        setFormData({
          title: '',
          slug: '',
          url: '',
          parentId: null,
          order: 0,
          isActive: true
        });
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {item ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="auto-generated from title if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="/path/to/page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Item
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white"
              >
                <option value="">-- None (Root Level) --</option>
                {allItems && allItems.map(i => (
                  <option key={i.id} value={i.id} disabled={item && i.id === item.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                {item ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  const { user } = useAuth();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Category items state
  const [categoryItems, setCategoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('create');
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Item modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [parentForNew, setParentForNew] = useState(null);
  
  // Drag-n-drop state
  const [hasChanges, setHasChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiGet('/api/admin/categories');
      const categories = response.data?.categories || [];
      setCategories(categories);
      
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [selectedCategory]);

  const fetchCategoryItems = useCallback(async (categoryId) => {
    setLoading(true);
    try {
      const response = await apiGet(`/api/admin/categories/${categoryId}/items`);
      setCategoryItems(response.data?.items || []);
      setHasChanges(false); // Reset changes on fetch
    } catch (error) {
      console.error('Error fetching category items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryItems(selectedCategory.id);
    }
  }, [selectedCategory, fetchCategoryItems]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const flattenItems = (items, result = []) => {
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        flattenItems(item.children, result);
      }
    });
    return result;
  };

  // ============================================================================
  // DRAG-N-DROP HANDLERS
  // ============================================================================

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    setCategoryItems((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;

      const newItems = arrayMove(items, oldIndex, newIndex);
      setHasChanges(true);
      return newItems;
    });
  };

  const handleSaveReorder = async () => {
    if (!selectedCategory || !hasChanges) return;

    setIsSavingOrder(true);
    try {
      // Flatten items with new order
      const flatItems = flattenItems(categoryItems);
      const reorderData = flatItems.map((item, index) => ({
        id: item.id,
        order: index
      }));

      await apiPost(`/api/admin/categories/${selectedCategory.id}/items/reorder`, {
        items: reorderData
      });

      setHasChanges(false);
      await fetchCategoryItems(selectedCategory.id);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order changes');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCancelReorder = () => {
    if (selectedCategory) {
      fetchCategoryItems(selectedCategory.id);
    }
  };

  // ============================================================================
  // CATEGORY HANDLERS
  // ============================================================================

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryModalMode('create');
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalMode('edit');
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (category) => {
    const itemCount = category.itemCount || 0;
    const message = itemCount > 0
      ? `Are you sure you want to delete "${category.title}"? This will also delete ${itemCount} menu item(s).`
      : `Are you sure you want to delete "${category.title}"?`;
    
    if (!confirm(message)) return;

    try {
      await apiDelete(`/api/admin/categories/${category.id}`);
      await fetchCategories();
      
      // Reset selection if deleted category was selected
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(categories[0] || null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleSaveCategory = async (formData) => {
    try {
      // Auto-generate slug if empty
      if (!formData.slug && formData.title) {
        formData.slug = slugify(formData.title);
      }

      if (editingCategory) {
        await apiPut(`/api/admin/categories/${editingCategory.id}`, formData);
      } else {
        await apiPost('/api/admin/categories', formData);
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.message || 'Failed to save category');
    }
  };

  // ============================================================================
  // ITEM HANDLERS
  // ============================================================================

  const handleAddRoot = () => {
    setEditingItem(null);
    setParentForNew(null);
    setModalOpen(true);
  };

  const handleAddChild = (parent) => {
    setEditingItem(null);
    setParentForNew(parent);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setParentForNew(null);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"? This will also delete all child items.`)) {
      return;
    }

    try {
      await apiDelete(`/api/admin/categories/${selectedCategory.id}/items/${item.id}`);
      fetchCategoryItems(selectedCategory.id);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await apiPut(
          `/api/admin/categories/${selectedCategory.id}/items/${editingItem.id}`,
          formData
        );
      } else {
        const data = {
          ...formData,
          parentId: parentForNew ? parentForNew.id : formData.parentId
        };
        await apiPost(`/api/admin/categories/${selectedCategory.id}/items`, data);
      }
      
      setModalOpen(false);
      setEditingItem(null);
      setParentForNew(null);
      fetchCategoryItems(selectedCategory.id);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const flatItems = flattenItems(categoryItems);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Management</h1>
        <p className="text-gray-600 mt-1">Manage navigation categories and menu items</p>
      </div>

      {/* Category Selector */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Category
          </label>
          <button
            onClick={handleCreateCategory}
            className="text-sm bg-pink-600 text-white px-3 py-1.5 rounded-md hover:bg-pink-700 transition-colors flex items-center gap-1"
            title="Add new category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories yet. Click &quot;Add Category&quot; to create one.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="group relative">
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md transition-colors pr-16 ${
                    selectedCategory?.id === cat.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.title} ({cat.itemCount})
                </button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(cat);
                    }}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                    title="Edit category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Delete category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items Tree */}
      {selectedCategory && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory.title} - Menu Items
            </h2>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <>
                  <button
                    onClick={handleCancelReorder}
                    disabled={isSavingOrder}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReorder}
                    disabled={isSavingOrder}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Order
                      </>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={handleAddRoot}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Root Item
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : categoryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items yet. Click &quot;Add Root Item&quot; to create your first menu item.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoryItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {categoryItems.map(item => (
                      <SortableTreeNode
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleAddChild}
                        depth={0}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Item Modal */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          setParentForNew(null);
        }}
        onSave={handleSave}
        item={editingItem}
        categoryId={selectedCategory?.id}
        allItems={flatItems}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        mode={categoryModalMode}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategoriesWithStats } from '@/app/actions/categories';
import { CategoryCard } from './category-card';
import { CreateCategoryModal } from './create-category-modal';
import { MergeCategoryModal } from './merge-category-modal';
import type { Category } from '@/types/transactions';

interface CategoryWithStats extends Category {
  totalSpent: number
  transactionCount: number
};

export function CategoriesList() {
    const [categories, setCategories] = useState<CategoryWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
      setLoading(true);

      try {
        const data = await getCategoriesWithStats(showArchived);
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }, [showArchived]);

    useEffect(() => {
      loadCategories();
    }, [loadCategories]);

    const handleRefresh = () => {
      loadCategories();
    };

    const handleMerge = (categoryId: string) => {
      setSelectedCategory(categoryId);
      setShowMergeModal(true);
    };

    const activeCategories = categories.filter(c => !c.archived);
    const archivedCategories = categories.filter(c => c.archived);

    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading categories...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Category
            </button>
            <button
              onClick={() => setShowMergeModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Merge Categories
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Show archived</span>
          </label>
        </div>
        
        {activeCategories.length > 0 ? (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Categories</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onRefresh={handleRefresh}
                onMerge={handleMerge}
              />
            ))}
          </div>
        </div>
        ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new category.
          </p>
        </div>
        )}
        
        {showArchived && archivedCategories.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-500 mb-4">Archived Categories</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {archivedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onRefresh={handleRefresh}
              onMerge={handleMerge}
            />
            ))}

          </div>
        </div>
        )}
        
        <CreateCategoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRefresh}
        />

        <MergeCategoryModal
          isOpen={showMergeModal}
          categories={activeCategories}
          selectedCategoryId={selectedCategory}
          onClose={() => {
            setShowMergeModal(false)
            setSelectedCategory(null)
          }}
          onSuccess={handleRefresh}
        />
      </div>
    );
}
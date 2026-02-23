'use client';

import { useState } from 'react';
import { archiveCategory, unarchiveCategory, deleteCategory } from '@/app/actions/categories';
import { EditCategoryModal } from './edit-category-modal';
import { DeleteConfirmDialog } from '../transactions/delete-confirm-dialog';
import type { Category } from '@/types/transactions';

interface CategoryWithStats extends Category {
    totalSpent: number
    transactionCount: number
};

interface CategoryCardProps {
    category: CategoryWithStats
    onRefresh: () => void
    onMerge: (categoryId: string) => void
};

export function CategoryCard({ category, onRefresh, onMerge }: CategoryCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleArchive = async () => {
        setProcessing(true);

        try {
            if (category.archived) {
                await unarchiveCategory(category.id);
            } else {
                await archiveCategory(category.id);
            }

            onRefresh();
        } catch (error) {
            console.error('Failed to archive category:', error);
            alert(error instanceof Error ? error.message : 'Failed to archive category');
        } finally {
            setProcessing(false);
        }
    }

    const handleDelete = async () => {
        setProcessing(true);

        try {
            await deleteCategory(category.id);
            onRefresh();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete category');
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <div 
                className={`bg-white rounded-lg shadow p-6 relative ${
                category.archived ? 'opacity-60' : ''
                }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-12 h-12 rounded-lg shrink-0"
                            style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {category.name}
                            </h3>
                            
                            {category.is_system && (
                            <span className="text-xs text-gray-500">System category</span>
                            )}

                            {category.archived && (
                            <span className="text-xs text-gray-500">Archived</span>
                            )}

                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowEditModal(true)
                                            setShowMenu(false)
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Edit
                                    </button>

                                    {!category.is_system && (
                                    <>
                                        <button
                                            onClick={() => {
                                                onMerge(category.id)
                                                setShowMenu(false)
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Merge into another
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleArchive()
                                                setShowMenu(false)
                                            }}
                                            disabled={processing}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            {category.archived ? 'Unarchive' : 'Archive'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteDialog(true)
                                                setShowMenu(false)
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </>
                                    )}

                                </div>
                            </div>
                        </>
                        )}

                    </div>
                </div>
            
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">Total spent</span>
                        <span className="text-2xl font-semibold text-gray-900">
                            ${category.totalSpent.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">Transactions</span>
                        <span className="text-sm font-medium text-gray-700">
                            {category.transactionCount}
                        </span>
                    </div>
                </div>
            </div>
        
            <EditCategoryModal
                isOpen={showEditModal}
                category={category}
                onClose={() => setShowEditModal(false)}
                onSuccess={onRefresh}
            />

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                count={1}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                loading={processing}
            />
        </>
    );
}
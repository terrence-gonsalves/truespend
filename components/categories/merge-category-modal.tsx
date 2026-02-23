'use client';

import { useState, useEffect } from 'react';
import { mergeCategories } from '@/app/actions/categories';

interface MergeCategoryModalProps {
    isOpen: boolean
    categories: Array<{
        id: string
        name: string
        color: string | null
        is_system: boolean | null
        transactionCount: number
    }>
    selectedCategoryId: string | null
    onClose: () => void
    onSuccess: () => void
};

export function MergeCategoryModal({
    isOpen,
    categories,
    selectedCategoryId,
    onClose,
    onSuccess
}: MergeCategoryModalProps) {
    const [fromCategoryId, setFromCategoryId] = useState(selectedCategoryId || '');
    const [toCategoryId, setToCategoryId] = useState('');
    const [merging, setMerging] = useState(false);

    useEffect(() => {
        if (selectedCategoryId) {
            setFromCategoryId(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!fromCategoryId || !toCategoryId) {
            alert('Please select both categories');

            return;
        }

        if (fromCategoryId === toCategoryId) {
            alert('Please select different categories');

            return;
        }

        const fromCategory = categories.find(c => c.id === fromCategoryId);
        const toCategory = categories.find(c => c.id === toCategoryId);

        if (!fromCategory || !toCategory) {
            alert('Invalid category selection');

            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to merge "${fromCategory.name}" into "${toCategory.name}"? This will move ${fromCategory.transactionCount} transactions and delete "${fromCategory.name}". This action cannot be undone.`
        );

        if (!confirmed) return;

        setMerging(true);

        try {
            await mergeCategories(fromCategoryId, toCategoryId);
            setFromCategoryId('');
            setToCategoryId('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to merge categories:', error);
            alert(error instanceof Error ? error.message : 'Failed to merge categories');
        } finally {
            setMerging(false);
        }
    }

    const handleClose = () => {
        if (!merging) {
            setFromCategoryId('');
            setToCategoryId('');
            onClose();
        }
    };

    if (!isOpen) return null;

    const nonSystemCategories = categories.filter(c => !c.is_system);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleClose}
                />
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Merge Categories
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Move all transactions from one category to another, then delete the source category.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Merge from (will be deleted)
                            </label>
                            <select
                                value={fromCategoryId}
                                onChange={(e) => setFromCategoryId(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={merging}
                            >
                                <option value="">Select category...</option>

                                {nonSystemCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.transactionCount} transactions)
                                </option>
                                ))}

                            </select>
                        </div>
                        
                        <div className="flex justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Merge into (will keep)
                            </label>
                            <select
                                value={toCategoryId}
                                onChange={(e) => setToCategoryId(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={merging}
                            >
                                <option value="">Select category...</option>

                                {categories
                                    .filter(c => c.id !== fromCategoryId)
                                    .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.transactionCount} transactions)
                                    </option>
                                ))}

                            </select>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={merging || !fromCategoryId || !toCategoryId}
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {merging ? 'Merging...' : 'Merge Categories'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={merging}
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
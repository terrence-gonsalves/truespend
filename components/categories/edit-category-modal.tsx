'use client';

import { useState, useEffect } from 'react';
import { updateCategory } from '@/app/actions/categories';
import { CATEGORY_COLORS } from '@/lib/colors';

interface EditCategoryModalProps {
    isOpen: boolean
    category: {
        id: string
        name: string
        color: string | null
        is_system: boolean | undefined
    }
    onClose: () => void
    onSuccess: () => void
};

export function EditCategoryModal({ isOpen, category, onClose, onSuccess }: EditCategoryModalProps) {
    const [name, setName] = useState(category.name);
    const [color, setColor] = useState(category.color || CATEGORY_COLORS[0].value);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(category.name);
        setColor(category.color || CATEGORY_COLORS[0].value);
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!category.is_system && !name.trim()) {
            alert('Please enter a category name');
            
            return;
        }

        setSaving(true);

        try {
            await updateCategory(category.id, name.trim(), color);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setSaving(false);
        }
    }

  if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={() => !saving && onClose()}
                />
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Edit Category
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={saving || category.is_system}
                                autoFocus={!category.is_system}
                            />
                            
                            {category.is_system && (
                            <p className="mt-1 text-xs text-gray-500">
                                System category names cannot be changed
                            </p>
                            )}

                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                            </label>
                            <div className="grid grid-cols-6 gap-2">

                                {CATEGORY_COLORS.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    onClick={() => setColor(colorOption.value)}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                        color === colorOption.value
                                        ? 'border-blue-600 scale-110'
                                        : 'border-transparent hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: colorOption.value }}
                                    title={colorOption.name}
                                    disabled={saving}
                                />
                                ))}

                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
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
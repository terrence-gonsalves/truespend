'use client';

import { useState } from 'react'
import { bulkDeleteTransactions, bulkUpdateCategory, bulkUpdateAccount } from '@/app/actions/transaction';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import type { Category, Account } from '@/types/transactions';

interface BulkActionsProps {
    selectedIds: string[]
    categories: Category[]
    accounts: Account[]
    onComplete: () => void
};

export function BulkActions({ selectedIds, categories, accounts, onComplete }: BulkActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleBulkDelete = async () => {
            setProcessing(true);

        try {
            await bulkDeleteTransactions(selectedIds);
            onComplete();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete transactions:', error);
            alert('Failed to delete transactions');
        } finally {
            setProcessing(false);
        }
    }

    const handleBulkCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;

        if (!categoryId) return;

        setProcessing(true);

        try {
            await bulkUpdateCategory(selectedIds, categoryId);
            onComplete();
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setProcessing(false);
        }
    };

    const handleBulkAccountChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const accountId = e.target.value;

        if (!accountId) return;

            setProcessing(true);

        try {
            await bulkUpdateAccount(selectedIds, accountId);
            onComplete();
        } catch (error) {
            console.error('Failed to update account:', error);
            alert('Failed to update account');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedIds.length} transaction{selectedIds.length !== 1 ? 's' : ''} selected
                    </span>

                    <div className="flex flex-wrap gap-2">
                        <select
                            onChange={handleBulkCategoryChange}
                            disabled={processing}
                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                            value=""
                        >
                            <option value="">Change Category...</option>

                            {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                            ))}

                        </select>
                        
                        <select
                            onChange={handleBulkAccountChange}
                            disabled={processing}
                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                            value=""
                        >
                            <option value="">Change Account...</option>

                            {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                            ))}

                        </select>
                        
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={processing}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                count={selectedIds.length}
                onConfirm={handleBulkDelete}
                onCancel={() => setShowDeleteDialog(false)}
                loading={processing}
            />
        </>
    );
}
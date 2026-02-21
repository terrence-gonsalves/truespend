'use client';

import { useState } from 'react';
import { updateTransaction, deleteTransaction } from '@/app/actions/transaction';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import type { Transaction, Category, Account } from '@/types/transactions';

interface TransactionCardProps {
    transaction: Transaction
    categories: Category[]
    accounts: Account[]
    isSelected: boolean
    onSelect: (selected: boolean) => void
    onRefresh: () => void
};

export function TransactionCard({
    transaction,
    categories,
    accounts,
    isSelected,
    onSelect,
    onRefresh
}: TransactionCardProps) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)

  const [editData, setEditData] = useState({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toString(),
        category_id: transaction.category_id || '',
        account_id: transaction.account_id || ''
  });

  const handleSave = async () => {
        setSaving(true);

        try {
            await updateTransaction(transaction.id, {
                date: editData.date,
                description: editData.description,
                amount: parseFloat(editData.amount.toString()),
                category_id: editData.category_id || null,
                account_id: editData.account_id || null
            });
            setEditing(false);
            onRefresh();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction');
        } finally {
            setSaving(false);
        }
  };

    const handleCancel = () => {
        setEditData({
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount.toString(),
            category_id: transaction.category_id || '',
            account_id: transaction.account_id || ''
        });
        setEditing(false);
    };

    const handleDelete = async () => {
        setDeleting(true);

        try {
            await deleteTransaction(transaction.id);
            onRefresh();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction');
        } finally {
            setDeleting(false);
        }
    };

    if (editing) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-900">Editing</span>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={editData.date}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={editData.category_id}
                            onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="">None</option>

                            {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                            ))}

                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
                        <select
                            value={editData.account_id}
                            onChange={(e) => setEditData({ ...editData, account_id: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="">None</option>

                            {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name}
                            </option>
                            ))}
                            
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editData.amount}
                            onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(transaction.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <p className={`text-lg font-semibold ${transaction.is_income ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.is_income ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs">

                    {transaction.category && (
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full font-medium"
                        style={{
                            backgroundColor: transaction.category.color ? `${transaction.category.color}20` : '#e5e7eb',
                            color: transaction.category.color || '#374151'
                        }}
                    >
                        {transaction.category.name}
                    </span>
                    )}

                    {transaction.account && (
                    <span className="text-gray-500">
                        {transaction.account.name}
                    </span>
                    )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={() => setEditing(true)}
                        className="flex-1 text-sm text-blue-600 hover:text-blue-900 font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex-1 text-sm text-red-600 hover:text-red-900 font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                count={1}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                loading={deleting}
            />
        </>
    );
}
'use client';

import { useState } from 'react';
import { updateTransaction, deleteTransaction } from '@/app/actions/transaction';
import { DeleteConfirmDialog } from '../transactions/delete-confirm-dialog';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';
import type { Transaction, Category, Account } from '@/types/transactions';

interface RecentTransactionsProps {
    transactions: Transaction[]
    categories: Category[]
    accounts: Account[]
    onRefresh: () => void
};

export function RecentTransactions({ transactions, categories, accounts, onRefresh }: RecentTransactionsProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    const [editData, setEditData] = useState<{
        date: string
        description: string
        amount: string
        category_id: string
        account_id: string
    }>({
        date: '',
        description: '',
        amount: '',
        category_id: '',
        account_id: ''
    });

    const handleEdit = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setEditData({
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount.toString(),
            category_id: transaction.category_id || '',
            account_id: transaction.account_id || ''
        });
    };

    const handleSave = async () => {
        if (!editingId) return;

        setSaving(true);

        try {
            await updateTransaction(editingId, {
                date: editData.date,
                description: editData.description,
                amount: parseFloat(editData.amount),
                category_id: editData.category_id || null,
                account_id: editData.account_id || null
            });
            setEditingId(null);
            onRefresh();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction');
        } finally {
            setSaving(false);
        }
    }

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        setDeleting(true);

        try {
            await deleteTransaction(deletingId);
            onRefresh();
            setDeletingId(null);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction');
        } finally {
            setDeleting(false);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No transactions yet</p>

                    <Link href="/import" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
                        Import transactions →
                    </Link>
                </div>
            </div>
        );
    } 

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">

                    {transactions.map((transaction) => (
                    <li key={transaction.id} className="p-4 hover:bg-gray-50">

                        {editingId === transaction.id ? (

                        // edit Mode
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={editData.date}
                                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editData.amount}
                                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <input
                                type="text"
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={editData.category_id}
                                    onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">No Category</option>

                                    {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}

                                </select>
                                <select
                                    value={editData.account_id}
                                    onChange={(e) => setEditData({ ...editData, account_id: e.target.value })}
                                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                <option value="">No Account</option>

                                {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}

                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex-1 text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        ) : (

                        // view Mode
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {transaction.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </p>

                                    {transaction.category && (
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                        style={{
                                            backgroundColor: transaction.category.color ? `${transaction.category.color}20` : '#e5e7eb',
                                            color: transaction.category.color || '#374151'
                                        }}
                                    >
                                        {transaction.category.name}
                                    </span>
                                    )}
                                </div>
                            </div>
                            <div className="ml-4 flex items-center gap-3">
                                <p className={`text-sm font-semibold ${transaction.is_income ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.is_income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount)).replace('$', '')}
                                </p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(transaction)}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeletingId(transaction.id)}
                                        className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        )}

                    </li>
                    ))}

                </ul>
            </div>

            <DeleteConfirmDialog
                isOpen={!!deletingId}
                count={1}
                onConfirm={handleDelete}
                onCancel={() => setDeletingId(null)}
                loading={deleting}
            />
        </>
    );
}
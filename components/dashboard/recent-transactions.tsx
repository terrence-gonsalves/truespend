'use client';

import { useState } from 'react';
import { deleteTransaction } from '@/app/actions/transaction';
import { DeleteConfirmDialog } from '../transactions/delete-confirm-dialog';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';
import type { Transaction } from '@/types/transactions';

interface RecentTransactionsProps {
    transactions: Transaction[]
    onRefresh: () => void
};

export function RecentTransactions({ transactions, onRefresh }: RecentTransactionsProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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
    }

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
                                    <Link
                                        href={`/transactions?edit=${transaction.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeletingId(transaction.id)}
                                        className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
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
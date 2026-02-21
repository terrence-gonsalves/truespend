'use client';

import { TransactionRow } from './transaction-row';
import { TransactionCard } from './transaction-card';
import type { Transaction, Category, Account } from '@/types/transactions';

interface TransactionTableProps {
    transactions: Transaction[]
    categories: Category[]
    accounts: Account[]
    loading: boolean
    selectedIds: string[]
    onSelectTransaction: (id: string, selected: boolean) => void
    onSelectAll: (selected: boolean) => void
    onRefresh: () => void
};

export function TransactionTable({
    transactions,
    categories,
    accounts,
    loading,
    selectedIds,
    onSelectTransaction,
    onSelectAll,
    onRefresh
}: TransactionTableProps) {
    const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">Loading transactions...</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Import a CSV file to get started with tracking your transactions.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">

                        {transactions.map((transaction) => (
                        <TransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            categories={categories}
                            accounts={accounts}
                            isSelected={selectedIds.includes(transaction.id)}
                            onSelect={(selected: boolean) => onSelectTransaction(transaction.id, selected)}
                            onRefresh={onRefresh}
                        />
                        ))}

                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">

                {transactions.map((transaction) => (
                <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    categories={categories}
                    accounts={accounts}
                    isSelected={selectedIds.includes(transaction.id)}
                    onSelect={(selected: boolean) => onSelectTransaction(transaction.id, selected)}
                    onRefresh={onRefresh}
                />
                ))}

            </div>
        </>
    );
}
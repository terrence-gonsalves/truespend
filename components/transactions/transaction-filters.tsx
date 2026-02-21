'use client';

import { useState } from 'react';
import type { TransactionFilters as Filters } from '@/app/actions/transaction';

interface Category {
    id: string
    name: string
    color: string | null
};

interface Account {
    id: string
    name: string
    institution: string | null
};

interface TransactionFiltersProps {
    filters: Filters
    categories: Category[]
    accounts: Account[]
    onFilterChange: (filters: Filters) => void
};

export function TransactionFilters({
    filters,
    categories,
    accounts,
    onFilterChange
}: TransactionFiltersProps) {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [categoryId, setCategoryId] = useState(filters.categoryId || '');
    const [accountId, setAccountId] = useState(filters.accountId || '');
    const [transactionType, setTransactionType] = useState(filters.transactionType || 'all');

    const handleApplyFilters = () => {
        onFilterChange({
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            categoryId: categoryId || undefined,
            accountId: accountId || undefined,
            transactionType: transactionType as 'income' | 'expense' | 'all'
        });
    };

    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setCategoryId('');
        setAccountId('');
        setTransactionType('all');
        onFilterChange({ transactionType: 'all' });
    };

    const hasActiveFilters = dateFrom || dateTo || categoryId || accountId || transactionType !== 'all';

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">All Categories</option>

                        {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                        ))}

                    </select>
                </div>                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account
                    </label>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">All Accounts</option>

                        {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                        ))}

                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                    </label>
                    <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as 'income' | 'expense' | 'all')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expenses</option>
                    </select>
                </div>
            </div>
            
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleApplyFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Apply Filters
                </button>

                {hasActiveFilters && (
                <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Clear Filters
                </button>
                )}

            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { getTransactions, getCategories, getAccounts, type TransactionFilters } from '@/app/actions/transactions';
import { TransactionTable } from './transaction-table';
import { TransactionFilters as Filters } from './transaction-filters';
import { BulkActions } from './bulk-actions';

interface Transaction {
    id: string
    date: string
    description: string
    amount: number
    category_id: string | null
    account_id: string | null
    is_income: boolean
    category?: {
        id: string
        name: string
        color: string | null
    }
    account?: {
        id: string
        name: string
        institution: string | null
    }
};

interface Category {
    id: string
    name: string
    color: string | null
    is_system: boolean | null
    user_id: string | null
    archived: boolean | null
    created_at: string | null
};

interface Account {
    id: string
    name: string
    institution: string | null
    user_id: string | null
    created_at: string | null
};

export function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<TransactionFilters>({
        transactionType: 'all'
    });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    useEffect(() => {
        loadCategoriesAndAccounts();
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            const result = await getTransactions(page, 25, filters);
            setTransactions(result.transactions);
            setTotalPages(result.totalPages);
            setTotalCount(result.count);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    }

    const loadCategoriesAndAccounts = async () => {
        try {
            const [cats, accts] = await Promise.all([
                getCategories(),
                getAccounts()
            ]);

            setCategories(cats);
            setAccounts(accts);
        } catch (error) {
            console.error('Failed to load categories/accounts:', error);
        }
    };

    const handleFilterChange = (newFilters: TransactionFilters) => {
        setFilters(newFilters);
        setPage(1); // reset to first page when filters change
    };

    const handleRefresh = () => {
        loadData();
        setSelectedIds([]);
    };

    const handleSelectTransaction = (id: string, selected: boolean) => {
        if (selected) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedIds(transactions.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkActionComplete = () => {
        handleRefresh();
    };

    return (
        <div className="space-y-6">
            <Filters
                filters={filters}
                categories={categories}
                accounts={accounts}
                onFilterChange={handleFilterChange}
            />
            
            {selectedIds.length > 0 && (
            <BulkActions
                selectedIds={selectedIds}
                categories={categories}
                accounts={accounts}
                onComplete={handleBulkActionComplete}
            />
            )}
            
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {transactions.length} of {totalCount} transactions
                    </p>

                    {selectedIds.length > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                        {selectedIds.length} selected
                    </p>
                    )}

                </div>
            </div>
            
            <TransactionTable
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                loading={loading}
                selectedIds={selectedIds}
                onSelectTransaction={handleSelectTransaction}
                onSelectAll={handleSelectAll}
                onRefresh={handleRefresh}
            />
            
            {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Page <span className="font-medium">{page}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { importTransactions, getCategories, getAccounts, createAccount } from '@/app/actions/import';
import type { TransactionRow } from '@/lib/csv-utils';

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

interface ReviewStepProps {
    transactions: TransactionRow[]
    filename: string
    onComplete: (result: { imported: number; duplicates: number }) => void
    onBack: () => void
};

export function ReviewStep({ transactions, filename, onComplete, onBack }: ReviewStepProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [importing, setImporting] = useState(false);
    const [showNewAccount, setShowNewAccount] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountInstitution, setNewAccountInstitution] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, accts] = await Promise.all([
                    getCategories(),
                    getAccounts()
                ]);

                setCategories(cats);
                setAccounts(accts);

                // auto-select "Uncategorized" if available
                const uncategorized = cats.find(c => c.name === 'Uncategorized');

                if (uncategorized) {
                    setSelectedCategoryId(uncategorized.id);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };

        loadData();
    }, []);

    const handleCreateAccount = async () => {
        if (!newAccountName.trim()) return;

        try {
            const newAccount = await createAccount(newAccountName, newAccountInstitution || undefined);
            
            // reload accounts
            const accts = await getAccounts();
            setAccounts(accts);
            setSelectedAccountId(newAccount.id);
            setNewAccountName('');
            setNewAccountInstitution('');
            setShowNewAccount(false);
        } catch (error) {
            console.error('Failed to create account:', error);
            alert('Failed to create account');
        }
    };

    const handleImport = async () => {
        setImporting(true);

        try {
            const result = await importTransactions(
                transactions,
                selectedCategoryId || null,
                selectedAccountId || null,
                filename
            );

            onComplete(result);
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Please try again.');

            setImporting(false);
        }
    };

    const stats = {
        total: transactions.length,
        income: transactions.filter(t => t.isIncome).length,
        expenses: transactions.filter(t => !t.isIncome).length,
        totalIncome: transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions.filter(t => !t.isIncome).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Review & Import</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Review the transactions and configure import settings
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600">Income</p>
                    <p className="mt-2 text-3xl font-semibold text-green-900">
                        ${stats.totalIncome.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600">{stats.income} transactions</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-600">Expenses</p>
                    <p className="mt-2 text-3xl font-semibold text-red-900">
                        ${stats.totalExpenses.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-600">{stats.expenses} transactions</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Default Category
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Transactions without a category will be assigned this category
                    </p>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">None</option>

                        {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Account
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Which account are these transactions from?
                    </p>

                    {!showNewAccount ? (
                    <div className="mt-2 flex gap-2">
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="">None</option>

                            {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} {account.institution ? `(${account.institution})` : ''}
                            </option>
                            ))}

                        </select>

                        <button
                            onClick={() => setShowNewAccount(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
                        >
                            + New
                        </button>
                    </div>
                    ) : (
                    <div className="mt-2 space-y-2">
                        <input
                            type="text"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="Account name (e.g., 'Chase Checking')"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <input
                            type="text"
                            value={newAccountInstitution}
                            onChange={(e) => setNewAccountInstitution(e.target.value)}
                            placeholder="Institution (optional, e.g., 'Chase Bank')"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateAccount}
                                disabled={!newAccountName.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowNewAccount(false)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
            
            <div className="rounded-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                        Transaction Preview (first 10)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Type
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">

                            {transactions.slice(0, 10).map((transaction, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                    {transaction.date}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                    {transaction.description}
                                </td>
                                <td className={`px-4 py-2 text-sm text-right whitespace-nowrap ${
                                        transaction.isIncome ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    {transaction.isIncome ? 'Income' : 'Expense'}
                                </td>
                            </tr>
                            ))}

                        </tbody>
                    </table>
                </div>

                {transactions.length > 10 && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        + {transactions.length - 10} more transactions
                    </p>
                </div>
                )}

            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                    onClick={onBack}
                    disabled={importing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={handleImport}
                    disabled={importing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    {importing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Importing...
                        </>
                    ) : (
                        'Import Transactions'
                    )}
                </button>
            </div>
        </div>
    );
}
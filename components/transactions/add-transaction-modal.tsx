'use client';

import { useState } from 'react';
import { createTransaction } from '@/app/actions/transactions';
import { useToast } from '@/components/ui/toast';

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    categories: Array<{ id: string; name: string; color: string | null }>
    accounts: Array<{ id: string; name: string; institution?: string | null }>
}

export function AddTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    categories,
    accounts
}: AddTransactionModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category_id: '',
        account_id: '',
        is_income: false
    });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            showToast('Please enter a description', 'warning');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            showToast('Please enter a valid amount', 'warning');
            return;
        }

        setLoading(true);

        try {
            await createTransaction({
                date: formData.date,
                description: formData.description.trim(),
                amount: parseFloat(formData.amount),
                category_id: formData.category_id || null,
                account_id: formData.account_id || null,
                is_income: formData.is_income
            });

            showToast('Transaction added successfully!', 'success');
        
            // reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                category_id: '',
                account_id: '',
                is_income: false
            });
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create transaction:', error);
            showToast('Failed to create transaction', 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            category_id: '',
            account_id: '',
            is_income: false
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCancel} />
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Add Transaction
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_income: false })}
                                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                        !formData.is_income
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_income: true })}
                                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                        formData.is_income
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Income
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Grocery shopping, Salary, Rent"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select a category...</option>

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
                                value={formData.account_id}
                                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select an account...</option>

                                {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                    {account.institution && ` (${account.institution})`}
                                </option>
                                ))}

                            </select>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
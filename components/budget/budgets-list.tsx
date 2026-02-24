'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBudgetsForMonth, getAvailableMonths } from '@/app/actions/budgets';
import { BudgetCard } from './budget-card';

interface BudgetWithStats {
    category: {
        id: string
        name: string
        color: string | null
    }
    budget: {
        id: string
        amount: number
    } | null
    spent: number
    remaining: number
    percentage: number
};

export function BudgetsList() {
    const [budgets, setBudgets] = useState<BudgetWithStats[]>([]);
    const [months, setMonths] = useState<Array<{ value: string; label: string }>>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const loadMonths = useCallback(async () => {
        try {
            const availableMonths = await getAvailableMonths();
            setMonths(availableMonths);
            
            // set current month as default
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setSelectedMonth(currentMonth);
        } catch (error) {
            console.error('Failed to load months:', error);
        }
    }, []);

    const loadBudgets = useCallback(async () => {
        if (!selectedMonth) return;
        
        setLoading(true);

        try {
            const data = await getBudgetsForMonth(selectedMonth);
            setBudgets(data);
        } catch (error) {
            console.error('Failed to load budgets:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        loadMonths();
    }, [loadMonths]);

    useEffect(() => {
        if (selectedMonth) {
            loadBudgets();
        }
    }, [selectedMonth, loadBudgets]);

    const handleRefresh = () => {
        loadBudgets();
    };

    const totalBudget = budgets.reduce((sum, b) => sum + (b.budget?.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const budgetsWithLimit = budgets.filter(b => b.budget !== null);
    const budgetsWithoutLimit = budgets.filter(b => b.budget === null && b.spent > 0);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">Loading budgets...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Month
                </label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                
                    {months.map((month) => (
                    <option key={month.value} value={month.value}>
                        {month.label}
                    </option>
                    ))}

                </select>
            </div>
            
            {budgetsWithLimit.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Overall Budget</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Total Budget</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className={`text-2xl font-semibold ${totalPercentage >= 100 ? 'text-red-600' : totalPercentage >= 80 ? 'text-amber-600' : 'text-green-600'}`}>
                            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className={`text-2xl font-semibold ${totalRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            ${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block text-gray-600">
                                {totalPercentage.toFixed(0)}% of budget used
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
                        <div
                            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                            totalPercentage >= 100 ? 'bg-red-500' : totalPercentage >= 80 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                        />
                    </div>
                </div>
            </div>
            )}
            
            {budgetsWithLimit.length > 0 && (
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Category Budgets</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {budgetsWithLimit.map((budget) => (
                    <BudgetCard
                        key={budget.category.id}
                        budget={budget}
                        month={selectedMonth}
                        onRefresh={handleRefresh}
                    />
                    ))}

                </div>
            </div>
            )}
            
            {budgetsWithoutLimit.length > 0 && (
            <div>
                <h2 className="text-lg font-medium text-gray-500 mb-4">Categories Without Budgets</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {budgetsWithoutLimit.map((budget) => (
                    <BudgetCard
                        key={budget.category.id}
                        budget={budget}
                        month={selectedMonth}
                        onRefresh={handleRefresh}
                    />
                    ))}

                </div>
            </div>
            )}
            
            {budgetsWithLimit.length === 0 && budgetsWithoutLimit.length === 0 && (
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
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets or spending</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Start by importing transactions or setting budgets for your categories.
                </p>
            </div>
            )}

        </div>
    );
}
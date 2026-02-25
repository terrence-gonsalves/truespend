'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/app/actions/dashboard';
import { SpendingPieChart } from './spending-pie-chart';
import { SpendingTrendChart } from './spending-trend-chart';
import { RecentTransactions } from './recent-transactions';
import { BudgetAlerts } from './budget-alerts';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

import type { Transaction } from '@/types/transactions';

interface DashboardData {
    summary: {
        income: number
        expenses: number
        net: number
    }
    spendingByCategory: Array<{
        name: string
        color: string
        amount: number
    }>
    spendingTrend: Array<{
        date: string
        amount: number
    }>
    recentTransactions: Transaction[]
    budgetAlerts: Array<{
        category: {
            name: string
            color: string | null
        } | null
        budgetAmount: number
        spent: number
        percentage: number
    }>
};

export function DashboardContent() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            const dashboardData = await getDashboardData();
            setData(dashboardData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-sm text-gray-600">Failed to load dashboard data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Overview of your finances this month
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Income</dt>
                                    <dd className="text-2xl font-semibold text-green-600">
                                        {formatCurrency(data.summary.income)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Expenses</dt>
                                    <dd className="text-2xl font-semibold text-red-600">
                                        {formatCurrency(data.summary.expenses)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Net</dt>
                                    <dd className={`text-2xl font-semibold ${data.summary.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(data.summary.net)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SpendingPieChart data={data.spendingByCategory} />
                <SpendingTrendChart data={data.spendingTrend} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                        <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-700">
                            View all →
                        </Link>
                    </div>

                    <RecentTransactions transactions={data.recentTransactions} onRefresh={loadData} />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Budget Status</h2>
                        <Link href="/budgets" className="text-sm text-blue-600 hover:text-blue-700">
                            Manage →
                        </Link>
                    </div>

                    <BudgetAlerts alerts={data.budgetAlerts} />
                </div>
            </div>
        </div>
    );
}
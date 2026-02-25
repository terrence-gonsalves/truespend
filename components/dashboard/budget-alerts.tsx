'use client';

import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

interface BudgetAlertsProps {
    alerts: Array<{
        category: {
            name: string
            color: string | null
        } | null
        budgetAmount: number
        spent: number
        percentage: number
    }>
};

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
    if (alerts.length === 0) {
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
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No budgets set</p>

                    <Link href="/budgets" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
                        Create budgets →
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-amber-500';

        return 'bg-green-500';
    };

    const getTextColor = (percentage: number) => {
        if (percentage >= 100) return 'text-red-600';
        if (percentage >= 80) return 'text-amber-600';

        return 'text-green-600';
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">

                {alerts.map((alert, index) => {
                const categoryName = alert.category?.name ?? 'Unknown Category';
                const categoryColor = alert.category?.color ?? '#6B7280';
                
                return (
                    <li key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: categoryColor }}
                                />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {categoryName}
                                </p>
                            </div>
                            <p className={`text-sm font-semibold ${getTextColor(alert.percentage)}`}>
                                {alert.percentage.toFixed(0)}%
                            </p>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                                <div
                                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                                    className={`${getStatusColor(alert.percentage)} transition-all duration-500`}
                                />
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatCurrency(alert.spent)} spent</span>
                                <span>{formatCurrency(alert.budgetAmount)} budget</span>
                            </div>
                        </div>

                        {alert.percentage >= 100 && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
                            <p className="text-xs text-red-800 font-medium">
                                ⚠️ Over budget by {formatCurrency(alert.spent - alert.budgetAmount)}
                            </p>
                        </div>
                        )}

                        {alert.percentage >= 80 && alert.percentage < 100 && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                            <p className="text-xs text-amber-800 font-medium">
                                ⚠️ Approaching limit ({formatCurrency(alert.budgetAmount - alert.spent)} remaining)
                            </p>
                        </div>
                        )}

                    </li>
                );
                })}

            </ul>
        </div>
    );
}
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface SpendingPieChartProps {
    data: Array<{
        name: string
        color: string
        amount: number
    }>
};

export function SpendingPieChart({ data }: SpendingPieChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-gray-500">No spending data for this month</p>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
            name: item.name,
            value: item.amount,
            color: item.color
    }));

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >

                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}

                    </Pie>

                    <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : '$0.00'}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
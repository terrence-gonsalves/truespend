'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent';
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

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const chartData = data.map(item => ({
        name: item.name,
        value: item.amount,
        color: item.color,
        percentage: ((item.amount / total) * 100).toFixed(0)
    }));

    // custom legend formatter
    const renderLegend = (props: LegendProps) => {
        const { payload } = props;
        
        if (!payload) return null;
        
        return (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {payload.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-700">
                            {entry.value} ({chartData[index]?.percentage ?? '0'}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>

            <ResponsiveContainer width="100%" height={370}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={100}
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

                    <Legend 
                        content={renderLegend}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
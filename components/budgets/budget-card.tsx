'use client';

import { useState } from 'react';
import { setBudget, deleteBudget } from '@/app/actions/budgets';
import { formatCurrency } from '@/lib/format';

interface BudgetCardProps {
    budget: {
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
    }
    month: string
    onRefresh: () => void
};

export function BudgetCard({ budget, month, onRefresh }: BudgetCardProps) {
    const [editing, setEditing] = useState(false);
    const [amount, setAmount] = useState(budget.budget?.amount.toString() || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            alert('Please enter a valid amount');

            return;
        }

        setSaving(true);

        try {
            await setBudget(budget.category.id, month, numAmount);
            setEditing(false);
            onRefresh();
        } catch (error) {
            console.error('Failed to save budget:', error);
            alert('Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!budget.budget) return;

        const confirmed = window.confirm(
            `Are you sure you want to remove the budget for ${budget.category.name}?`
        );

        if (!confirmed) return;

        setSaving(true);

        try {
            await deleteBudget(budget.category.id, month);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete budget:', error);
            alert('Failed to delete budget');
        } finally {
            setSaving(false);
        }
    }

    const handleCancel = () => {
        setAmount(budget.budget?.amount.toString() || '');
        setEditing(false);
    };

    const getStatusColor = () => {
        if (!budget.budget) return 'bg-gray-500';
        if (budget.percentage >= 100) return 'bg-red-500';
        if (budget.percentage >= 80) return 'bg-amber-500';

        return 'bg-green-500';
    }

    const getTextColor = () => {
        if (!budget.budget) return 'text-gray-600';
        if (budget.percentage >= 100) return 'text-red-600';
        if (budget.percentage >= 80) return 'text-amber-600';

        return 'text-green-600';
    };

    if (editing) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-lg shrink-0"
                        style={{ backgroundColor: budget.category.color || '#6B7280' }}
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                        {budget.category.name}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Budget
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                $
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                                min="0"
                                className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: budget.category.color || '#6B7280' }}
          />
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {budget.category.name}
          </h3>
        </div>
        
        {budget.budget && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {budget.budget ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(budget.budget.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Spent</p>
              <p className={`text-sm font-semibold ${getTextColor()}`}>
                {formatCurrency(budget.spent)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                {budget.remaining >= 0 ? 'Remaining' : 'Over budget'}
              </span>
              <span className={`text-xs font-semibold ${getTextColor()}`}>
                {formatCurrency(Math.abs(budget.remaining))}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                className={`${getStatusColor()} shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500`}
              />
            </div>
            
            <p className="mt-1 text-xs text-gray-500 text-right">
              {budget.percentage.toFixed(0)}% used
            </p>
          </div>

          {/* Warning Message */}
          {budget.percentage >= 100 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ Over budget
              </p>
            </div>
          )}
          {budget.percentage >= 80 && budget.percentage < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ Approaching limit
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Spent this month</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(budget.spent)}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Set Budget
          </button>
        </div>
      )}
    </div>
  )
}
'use client';

import { useState } from 'react';
import { updateTransaction, deleteTransaction } from '@/app/actions/transactions';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { formatCurrency } from '@/lib/format';
import { formatLocalDate } from '@/lib/format-date';
import type { Transaction, Category, Account } from '@/types/transactions';
import { AddAccountModal } from '@/components/accounts/add-account-modal';

interface TransactionRowProps {
    transaction: Transaction
    categories: Category[]
    accounts: Account[]
    isSelected: boolean
    onSelect: (selected: boolean) => void
    onRefresh: () => void
};

export function TransactionRow({
    transaction,
    categories,
    accounts,
    isSelected,
    onSelect,
    onRefresh
}: TransactionRowProps) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [localAccounts, setLocalAccounts] = useState(accounts);
    const [editData, setEditData] = useState({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toString(),
        category_id: transaction.category_id || '',
        account_id: transaction.account_id || ''
    });

    // update local accounts when props change
    if (accounts !== localAccounts && accounts.length !== localAccounts.length) {
        setLocalAccounts(accounts);
    }   

    const handleSave = async () => {
        setSaving(true);

        try {
            await updateTransaction(transaction.id, {
                date: editData.date,
                description: editData.description,
                amount: parseFloat(editData.amount.toString()),
                category_id: editData.category_id || null,
                account_id: editData.account_id || null
            });

            setEditing(false);
            onRefresh();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount.toString(),
          category_id: transaction.category_id || '',
          account_id: transaction.account_id || ''
        });
        setEditing(false);
    };

    const handleDelete = async () => {
        setDeleting(true);

        try {
            await deleteTransaction(transaction.id);

            onRefresh();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction');
        } finally {
            setDeleting(false);
        }
    };

    const handleAccountCreated = (newAccountId: string) => {
      console.log('handleAccountCreated accessed!!!');

        // set the newly created account as selected
        setEditData({ ...editData, account_id: newAccountId });
        onRefresh(); // reload accounts from parent
    };

    if (editing) {
        return (
            <tr className="bg-blue-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </td>
              <td className="px-6 py-4">
                <select
                  value={editData.category_id}
                  onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">None</option>

                  {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                      {cat.name}
                  </option>
                  ))}

                </select>
              </td>
              <td className="px-6 py-4">
                  <div className="space-y-1">
                      <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-700">Account</label>
                          <button
                              type="button"
                              onClick={() => setShowAddAccount(true)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                              + Add
                          </button>
                      </div>
                      <select
                          value={editData.account_id}
                          onChange={(e) => setEditData({ ...editData, account_id: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                          <option value="">None</option>

                          {localAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                              {acc.name}
                              {acc.institution && ` (${acc.institution})`}
                          </option>
                          ))}

                      </select>
                  </div>
              </td>
              <td className="px-6 py-4">
                <input
                  type="number"
                  step="0.01"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-right"
                />
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
                >
                    Cancel
                </button>
              </td>
            </tr>
        );
      }

      return (
        <>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatLocalDate(transaction.date)}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
              {transaction.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">

                {transaction.category ? (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: transaction.category.color ? `${transaction.category.color}20` : '#e5e7eb',
                    color: transaction.category.color || '#374151'
                  }}
                >
                  {transaction.category.name}
                </span>
                ) : (
                <span className="text-gray-400">None</span>
                )}
                
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.account?.name || '-'}
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
              transaction.is_income ? 'text-green-600' : 'text-red-600'
            }`}>
                {transaction.is_income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount)).replace('$', '')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-900"
              >
                  Edit
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-900"
              >
                  Delete
              </button>
            </td>
          </tr>

          <DeleteConfirmDialog
              isOpen={showDeleteDialog}
              count={1}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteDialog(false)}
              loading={deleting}
          />

          <AddAccountModal
              isOpen={showAddAccount}
              onClose={() => setShowAddAccount(false)}
              onSuccess={handleAccountCreated}
          />
        </>
      );
}
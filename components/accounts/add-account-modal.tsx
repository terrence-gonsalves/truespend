'use client';

import { useState } from 'react';
import { createAccount } from '@/app/actions/import';
import { useToast } from '@/components/ui/toast';

interface AddAccountModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (accountId: string) => void
};

export function AddAccountModal({ isOpen, onClose, onSuccess }: AddAccountModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        institution: ''
    });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast('Please enter an account name', 'warning');

            return;
        }

        setLoading(true);

        try {
            const newAccount = await createAccount(
                formData.name.trim(),
                formData.institution.trim() || undefined
            );

            showToast('Account created successfully!', 'success');
            
            // reset form
            setFormData({ name: '', institution: '' });
            
            // call success callback with new account ID
            onSuccess(newAccount.id);
            onClose();
        } catch (error) {
            console.error('Failed to create account:', error);
            showToast('Failed to create account', 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setFormData({ name: '', institution: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCancel} />
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Add Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Chase Checking, Amex Credit Card"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                autoFocus
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Institution (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.institution}
                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                placeholder="e.g., Chase, American Express"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
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
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
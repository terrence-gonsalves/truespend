import { ProtectedLayout } from '@/components/protected-layout';
import { TransactionList } from '@/components/transactions/transaction-list';
import Link from 'next/link';

export default function TransactionsPage() {
    return (
        <ProtectedLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        View and manage your transactions
                    </p>
                </div>
                
                <TransactionList />

                <div className="mt-6">
                    <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </ProtectedLayout>
    );
}
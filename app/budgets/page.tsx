import Link from 'next/link';
import { BudgetsList } from '@/components/budgets/budgets-list';

export default function BudgetsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="mt-2 text-sm text-gray-600">
                Set and track monthly spending limits for each category
              </p>
            </div>
            
            <BudgetsList />

            <div className="mt-6">
                <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                    Back to Dashboard
                </Link>
            </div>
          </div>
        </div>
    );
}
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import Link from 'next/link';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user }, } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900">TrueSpend</h1>

                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                    <p className="mt-1 text-sm text-gray-600">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/import" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <h3 className="text-lg font-medium text-gray-900">Import Transactions</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Upload your bank CSV to get started
                            </p>

                            <div className="mt-4">
                                <span className="text-blue-600 text-sm font-medium">
                                    Get started →
                                </span>
                            </div>
                        </div>
                    </Link>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <h3 className="text-lg font-medium text-gray-900">View Transactions</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage and categorize your spending
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <h3 className="text-lg font-medium text-gray-900">Set Budgets</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Create monthly spending limits
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
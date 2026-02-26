import Link from 'next/link';
import { CategoriesList } from '@/components/categories/categories-list';
import { ProtectedLayout } from '@/components/protected-layout';

export default function CategoriesPage() {
    return (
        <ProtectedLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Organize your transactions with custom categories
                    </p>
                </div>
                
                <CategoriesList />

                <div className="mt-6">
                    <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </ProtectedLayout>
    );
}
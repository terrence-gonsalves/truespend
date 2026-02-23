import { CategoriesList } from '@/components/categories/categories-list';

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Organize your transactions with custom categories
                    </p>
                </div>
                
                <CategoriesList />
            </div>
        </div>
    );
}
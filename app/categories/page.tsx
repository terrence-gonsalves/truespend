import Link from 'next/link';
import { CategoriesList } from '@/components/categories/categories-list';
import { ProtectedLayout } from '@/components/protected-layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ensureUserHousehold } from '@/app/actions/ensure-household';

export default async function CategoriesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
        redirect('/login')
    }
    
    // ensure household exists (creates if needed)
    await ensureUserHousehold();

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
            </div>
        </ProtectedLayout>
    );
}
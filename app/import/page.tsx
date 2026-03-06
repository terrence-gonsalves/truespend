import Link from 'next/link';
import { ImportWizard } from '@/components/import/import-wizrd';
import { ProtectedLayout } from '@/components/protected-layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ensureUserHousehold } from '@/app/actions/ensure-household';

export default async function ImportPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
        redirect('/login')
    }
    
    // ensure household exists (creates if needed)
    await ensureUserHousehold();

    return (
        <ProtectedLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Upload your bank CSV file to import transactions
                    </p>
                </div>
            
                <ImportWizard />
            </div>
        </ProtectedLayout>
    )
}
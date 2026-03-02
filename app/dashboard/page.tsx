import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { ProtectedLayout } from '@/components/protected-layout';
import { ensureUserHousehold } from '@/app/actions/ensure-household';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // ensure household exists (creates if needed)
    await ensureUserHousehold();

    return (
        <ProtectedLayout>
            <DashboardContent />
        </ProtectedLayout>
    );
}
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { ProtectedLayout } from '@/components/protected-layout';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <ProtectedLayout>
            <DashboardContent />
        </ProtectedLayout>
    );
}
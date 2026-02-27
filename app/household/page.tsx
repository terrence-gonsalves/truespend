import { ProtectedLayout } from '@/components/protected-layout';
import { HouseholdSettings } from '@/components/household/household-settings';

export default function HouseholdSettingsPage() {
    return (
        <ProtectedLayout>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Household Settings</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your household members and invite others to join
                    </p>
                </div>
                
                <HouseholdSettings />
            </div>
        </ProtectedLayout>
    );
}
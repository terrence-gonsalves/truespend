import { HelpContent } from '@/components/help/help-content';
import { ProtectedLayout } from '@/components/protected-layout';

export default function HelpPage() {
    return (
        <ProtectedLayout>
            <HelpContent />
        </ProtectedLayout>
    );
}
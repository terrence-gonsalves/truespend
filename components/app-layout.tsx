'use client';

import { Navigation } from '@/components/navigation';
import { ToastProvider } from '@/components/ui/toast';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main>{children}</main>
            </div>
        </ToastProvider>
    );
}
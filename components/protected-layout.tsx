import { Navigation } from './navigation';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            {children}
        </div>
    );
}
import Link from 'next/link';
import { ImportWizard } from '@/components/import/import-wizrd';

export default function ImportPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Upload your bank CSV file to import transactions
                    </p>
                </div>
            
                <ImportWizard />

                <div className="mt-6">
                    <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                        Back to Dashboard
                    </Link>
            </div>
            </div>
        </div>
    )
}
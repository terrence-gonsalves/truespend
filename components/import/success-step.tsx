'use client';

import Link from 'next/link';

interface SuccessStepProps {
    imported: number
    duplicates: number
    onStartOver: () => void
};

export function SuccessStep({ imported, duplicates, onStartOver }: SuccessStepProps) {
    return (
        <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Import Complete!</h2>
            
            <div className="mt-6 max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Successfully imported:</span>
                        <span className="text-lg font-semibold text-green-600">{imported} transactions</span>
                    </div>
                    
                    {duplicates > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duplicates skipped:</span>
                        <span className="text-lg font-semibold text-gray-600">{duplicates} transactions</span>
                    </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                <Link
                    href="/transactions"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    View Transactions
                </Link>
                <button
                    onClick={onStartOver}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Import Another File
                </button>
            </div>

            <div className="mt-6">
                <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { UploadStep } from './upload-step';
import { MappingStep } from './mapping-step';
import { ReviewStep } from './review-step';
import { SuccessStep } from './success-step';
import type { ParsedCSV, ColumnMapping, TransactionRow } from '@/lib/csv-utils';

type Step = 'upload' | 'mapping' | 'review' | 'importing' | 'success';

export function ImportWizard() {
    const [currentStep, setCurrentStep] = useState<Step>('upload');
    const [csvData, setCsvData] = useState<ParsedCSV | null>(null);
    const [filename, setFilename] = useState<string>('');
    const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);
    const [importResult, setImportResult] = useState<{
        imported: number
        duplicates: number
    } | null>(null);

    const steps = [
        { 
            id: 'upload', 
            name: 'Upload CSV', 
            status: currentStep === 'upload' ? 'current' : 'complete' 
        },
        { 
            id: 'mapping', 
            name: 'Map Columns', 
            status: currentStep === 'upload' ? 'upcoming' : currentStep === 'mapping' ? 'current' : 'complete' 
        },
        { 
            id: 'review', 
            name: 'Review', 
            status: ['upload', 'mapping'].includes(currentStep) ? 'upcoming' : currentStep === 'review' ? 'current' : 'complete' 
        },
        { 
            id: 'success', 
            name: 'Complete', 
            status: currentStep === 'success' ? 'current' : 'upcoming' 
        },
    ];

    const handleUploadComplete = (data: ParsedCSV, name: string) => {
        setCsvData(data)
        setFilename(name)
        setCurrentStep('mapping')
    };

    const handleMappingComplete = (mapping: ColumnMapping, mappedTransactions: TransactionRow[]) => {
        setColumnMapping(mapping)
        setTransactions(mappedTransactions)
        setCurrentStep('review')
    };

    const handleImportComplete = (result: { imported: number; duplicates: number }) => {
        setImportResult(result)
        setCurrentStep('success')
    };

    const handleStartOver = () => {
        setCsvData(null)
        setFilename('')
        setColumnMapping(null)
        setTransactions([])
        setImportResult(null)
        setCurrentStep('upload')
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200 px-6 py-4">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center justify-between">

                        {steps.map((step, stepIdx) => (
                        <li key={step.name} className="relative flex-1">

                            {step.status === 'complete' ? (
                            <div className="group flex items-center">
                                <span className="flex items-center">
                                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path 
                                                fillRule="evenodd" 
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                    <span className="ml-3 text-sm font-medium text-gray-900">{step.name}</span>
                                </span>
                            </div>
                            ) : step.status === 'current' ? (
                            <div className="flex items-center">
                                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                </span>
                                <span className="ml-3 text-sm font-medium text-blue-600">{step.name}</span>
                            </div>
                            ) : (
                            <div className="group flex items-center">
                                <span className="flex items-center">
                                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                        <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                    </span>
                                    <span className="ml-3 text-sm font-medium text-gray-500">{step.name}</span>
                                </span>
                            </div>
                            )};

                            {stepIdx !== steps.length - 1 && (
                            <div className="absolute top-4 left-[calc(50%+2rem)] hidden h-0.5 w-full bg-gray-200 lg:block">
                                <div 
                                    className={`h-full ${step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    style={{ width: step.status === 'complete' ? '100%' : '0%' }}
                                />
                            </div>
                            )};

                        </li>
                        ))};

                    </ol>
                </nav>
            </div>
            <div className="px-6 py-8">
                {currentStep === 'upload' && (
                <UploadStep onComplete={handleUploadComplete} />
                )};

                {currentStep === 'mapping' && csvData && (
                <MappingStep 
                    csvData={csvData}
                    onComplete={handleMappingComplete}
                    onBack={() => setCurrentStep('upload')}
                />
                )}

                {currentStep === 'review' && (
                <ReviewStep
                    transactions={transactions}
                    filename={filename}
                    onComplete={handleImportComplete}
                    onBack={() => setCurrentStep('mapping')}
                />
                )}

                {currentStep === 'importing' && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Importing transactions...</p>
                </div>
                )}

                {currentStep === 'success' && importResult && (
                <SuccessStep 
                    imported={importResult.imported}
                    duplicates={importResult.duplicates}
                    onStartOver={handleStartOver}
                />
                )}
            </div>
        </div>
    )
}
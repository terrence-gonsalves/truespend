'use client';

import { useState } from 'react';
import { parseCSV, validateCSVFile, validateRowCount, type ParsedCSV } from '@/lib/csv-utils';

interface UploadStepProps {
    onComplete: (data: ParsedCSV, filename: string) => void
};

export function UploadStep({ onComplete }: UploadStepProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);

        try {

            // validate file
            const fileValidation = validateCSVFile(file);
            
            if (!fileValidation.valid) {
                setError(fileValidation.error || 'Invalid file');
                setUploading(false);

                return;
            }

            // read file content
            const content = await file.text();

            // validate row count
            const rowValidation = await validateRowCount(content);

            if (!rowValidation.valid) {
                setError(rowValidation.error || 'Too many rows');
                setUploading(false);

                return;
            }

            // parse CSV
            const parsed = parseCSV(content);

            if (parsed.rowCount === 0) {
                setError('CSV file contains no data rows');
                setUploading(false);

                return;
            }

            onComplete(parsed, file.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
            setUploading(false);
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Upload CSV File</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Select a CSV file exported from your bank. Maximum file size: 10MB, Maximum rows: 50,000
                </p>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center ${
                dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="sr-only"
                    accept=".csv"
                    onChange={handleChange}
                    disabled={uploading}
                />
            
                {uploading ? (
                <div>
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Processing file...</p>
                </div>
                ) : (
                <>
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="mt-4 flex justify-center text-sm">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                            <span>Upload a file</span>
                        </label>

                        <p className="pl-1 text-gray-600">or drag and drop</p>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">CSV files only, up to 10MB</p>
                </>
                )};

            </div>

            {error && (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                </div>
            </div>
            )}

            <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                    <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                        />
                    </svg>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-blue-700 font-medium">How to export CSV from your bank:</p>

                        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>Log in to your online banking</li>
                            <li>Navigate to your account transactions</li>
                            <li>Look for an &quot;Export&quot; or &quot;Download&quot; option</li>
                            <li>Select CSV format and download the file</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
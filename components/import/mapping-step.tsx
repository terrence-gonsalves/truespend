'use client';

import { useState, useEffect } from 'react';
import { autoDetectColumns, mapRowsToTransactions, type ParsedCSV, type ColumnMapping, type TransactionRow } from '@/lib/csv-utils';
import { saveColumnMapping, getColumnMappingPresets } from '@/app/actions/import';

interface ColumnMappingPreset {
    id: string
    name: string
    mapping: ColumnMapping
    user_id: string | null
    created_at: string | null
    is_default: boolean | null
};

interface MappingStepProps {
    csvData: ParsedCSV
    onComplete: (mapping: ColumnMapping, transactions: TransactionRow[]) => void
    onBack: () => void
};

export function MappingStep({ csvData, onComplete, onBack }: MappingStepProps) {
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: null,
        description: null,
        amount: null,
        category: null,
        account: null,
        balance: null
    });
    const [presets, setPresets] = useState<ColumnMappingPreset[]>([]);
    const [savingPreset, setSavingPreset] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [showSavePreset, setShowSavePreset] = useState(false);

    useEffect(() => {

        // auto-detect columns on mount
        const detected = autoDetectColumns(csvData.headers);
        setMapping(prev => ({ ...prev, ...detected }));;

        // load saved presets
        loadPresets();
    }, [csvData.headers]);

    const loadPresets = async () => {
        try {
            const data = await getColumnMappingPresets();

            // cast the mapping field from Json to ColumnMapping
            const typedPresets = data.map(preset => ({
                ...preset,
                mapping: preset.mapping as unknown as ColumnMapping
            }));

            setPresets(typedPresets);
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    }

    const handleMappingChange = (field: keyof ColumnMapping, value: number | null) => {
        setMapping(prev => ({ ...prev, [field]: value }));
    }

    const handleApplyPreset = (preset: ColumnMappingPreset) => {
        setMapping(preset.mapping);
    }

    const handleSavePreset = async () => {
        if (!presetName.trim()) return;

        setSavingPreset(true);

        try {
            await saveColumnMapping(presetName, mapping);
            await loadPresets();
            setPresetName('');
            setShowSavePreset(false);
        } catch (error) {
            console.error('Failed to save preset:', error);
        } finally {
            setSavingPreset(false);
        }
    }

    const handleContinue = () => {
        if (mapping.date === null || mapping.description === null || mapping.amount === null) {
            alert('Please map required fields: Date, Description, and Amount');

            return;
        }

        const transactions = mapRowsToTransactions(csvData.rows, mapping);
        
        if (transactions.length === 0) {
            alert('No valid transactions found. Please check your column mappings.');

            return;

        }

        onComplete(mapping, transactions);
    }

    const isValid = mapping.date !== null && mapping.description !== null && mapping.amount !== null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Map CSV Columns</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Match your CSV columns to transaction fields. Required fields are marked with *
                </p>
            </div>
            
            {presets.length > 0 && (
            <div className="rounded-md bg-gray-50 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Load Saved Mapping
                </label>
                <div className="flex flex-wrap gap-2">

                    {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        {preset.name}
                    </button>
                    ))}

                </div>
            </div>
            )};

            <div className="rounded-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">CSV Preview (first 3 rows)</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>

                                {csvData.headers.map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                                ))}
                                
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">

                            {csvData.rows.slice(0, 3).map((row, rowIdx) => (
                            <tr key={rowIdx}>

                                {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                    {cell}
                                </td>
                                ))}

                            </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Date Column *
                    </label>
                    <select
                        value={mapping.date ?? ''}
                        onChange={(e) => handleMappingChange('date', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Select column...</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description Column *
                    </label>
                    <select
                        value={mapping.description ?? ''}
                        onChange={(e) => handleMappingChange('description', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Select column...</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Amount Column *
                    </label>
                    <select
                        value={mapping.amount ?? ''}
                        onChange={(e) => handleMappingChange('amount', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Select column...</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Category Column (Optional)
                    </label>
                    <select
                        value={mapping.category ?? ''}
                        onChange={(e) => handleMappingChange('category', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">None</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Account Column (Optional)
                    </label>
                    <select
                        value={mapping.account ?? ''}
                        onChange={(e) => handleMappingChange('account', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">None</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Balance Column (Optional)
                    </label>
                    <select
                        value={mapping.balance ?? ''}
                        onChange={(e) => handleMappingChange('balance', e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">None</option>

                        {csvData.headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                            {header}
                        </option>
                        ))}

                    </select>
                </div>
            </div>

            {!showSavePreset ? (
            <button
                onClick={() => setShowSavePreset(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
            >
                Save this mapping for future use
            </button>
            ) : (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name (e.g., 'Chase Checking')"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim() || savingPreset}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    {savingPreset ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={() => setShowSavePreset(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
            )}
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!isValid}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue to Review
                </button>
            </div>
        </div>
    );
}
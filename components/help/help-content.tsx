'use client';

import { useState, useEffect } from 'react';
import { getAppVersion } from '@/app/actions/help';

interface Section {
    id: string
    title: string
    content: React.ReactNode
};

export function HelpContent() {
    const [openSection, setOpenSection] = useState<string>('getting-started');
    const [version, setVersion] = useState<string>('1.0.0');

    useEffect(() => {
        const loadVersion = async () => {
            const appVersion = await getAppVersion();
            setVersion(appVersion);
        }

        loadVersion();
    }, []);

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? '' : id);
    };

    const sections: Section[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Welcome to TrueSpend! This guide will help you get started with managing your personal finances.
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">1. Import Your Transactions</h4>
                            <p className="text-gray-600">
                                Start by importing your bank transactions via CSV file. Click on &ldquo;Import&ldquo; in the navigation menu and upload your bank&apos;s CSV export.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">2. Set Up Categories</h4>
                            <p className="text-gray-600">
                                Organize your spending by creating custom categories. Go to &ldquo;Categories&ldquo; to create, edit, or customize category colors.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">3. Create Budgets</h4>
                            <p className="text-gray-600">
                                Set monthly spending limits for each category. Navigate to &ldquo;Budgets&ldquo; to create and track your budget goals.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">4. Monitor Your Dashboard</h4>
                            <p className="text-gray-600">
                                View your financial overview on the Dashboard, which shows spending trends, budget status, and recent transactions.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'csv-import',
            title: 'CSV Import Guide',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        TrueSpend supports importing transactions from CSV files exported by your bank.
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Supported CSV Format</h4>
                            <p className="text-gray-600 mb-2">Your CSV file should contain columns for:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                <li><strong>Date</strong>: Transaction date (MM/DD/YYYY or YYYY-MM-DD)</li>
                                <li><strong>Description</strong>: Transaction description or merchant name</li>
                                <li><strong>Amount</strong>: Transaction amount (positive for income, negative for expenses)</li>
                                <li><strong>Category</strong> (optional): Transaction category</li>
                                <li><strong>Account</strong> (optional): Account name</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Import Steps</h4>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                                <li>Click &ldquo;Import&ldquo; in the navigation menu</li>
                                <li>Upload your CSV file (max 10MB, 50,000 rows)</li>
                                <li>Map the CSV columns to TrueSpend fields</li>
                                <li>Save column mapping as a preset for future imports (optional)</li>
                                <li>Review the transaction preview</li>
                                <li>Select or create an account for these transactions</li>
                                <li>Click &ldquo;Import Transactions&ldquo; to complete</li>
                            </ol>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Duplicate Detection</h4>
                            <p className="text-gray-600">
                                TrueSpend automatically detects and prevents duplicate transactions based on date, description, and amount. You can safely re-import files without creating duplicates.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'transactions',
            title: 'Managing Transactions',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        View, edit, and organize all your financial transactions.
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Viewing Transactions</h4>
                            <p className="text-gray-600">
                                The Transactions page displays all your transactions in a paginated table (25 per page), sorted by most recent first.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Filtering</h4>
                            <p className="text-gray-600 mb-2">Filter transactions by:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                <li>Date range (from/to dates)</li>
                                <li>Category</li>
                                <li>Account</li>
                                <li>Transaction type (Income, Expenses, or All)</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Editing Transactions</h4>
                            <p className="text-gray-600">
                                Click &ldquo;Edit&ldquo; on any transaction to modify its date, description, amount, category, or account. Changes are saved inline.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Bulk Operations</h4>
                            <p className="text-gray-600 mb-2">Select multiple transactions to:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                <li>Change category for all selected</li>
                                <li>Assign to a different account</li>
                                <li>Delete multiple transactions at once</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Deleting Transactions</h4>
                            <p className="text-gray-600">
                                Click &ldquo;Delete&ldquo; on a transaction or use bulk delete. You&apos;ll be asked to confirm before any transactions are removed.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'categories-budgets',
            title: 'Categories & Budgets',
            content: (
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Creating Categories</h4>
                                    <p className="text-gray-600">
                                        Click &ldquo;New Category&ldquo; to create a custom category. Choose a name and color to help organize your spending.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">System Categories</h4>
                                    <p className="text-gray-600">
                                        TrueSpend includes default categories like &ldquo;Uncategorized,&ldquo; &ldquo;Income,&ldquo; and &ldquo;Transfer.&ldquo; You can change their colors but not their names.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Merging Categories</h4>
                                    <p className="text-gray-600">
                                        Combine two categories by clicking &ldquo;Merge Categories.&ldquo; All transactions from the source category will be moved to the target category, and the source will be deleted.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Archiving Categories</h4>
                                    <p className="text-gray-600">
                                        Archive categories you no longer use. Archived categories are hidden by default but can be viewed by toggling &ldquo;Show archived.&ldquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Budgets</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Setting Budgets</h4>
                                    <p className="text-gray-600">
                                        Create monthly spending limits for each category. Click &ldquo;Set Budget&ldquo; on any category card to define your limit.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Budget Alerts</h4>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li><strong className="text-amber-600">Warning (80-99%)</strong>: Approaching your budget limit</li>
                                        <li><strong className="text-red-600">Over Budget (100%+)</strong>: You&apos;ve exceeded your budget</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Historical Budgets</h4>
                                    <p className="text-gray-600">
                                        Use the month selector to view past budget performance and compare spending across different months.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Overall Budget Summary</h4>
                                    <p className="text-gray-600">
                                        The top of the Budgets page shows your total budget, total spent, and remaining balance for the selected month.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'faq',
            title: 'Frequently Asked Questions',
            content: (
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Is my financial data secure?</h4>
                            <p className="text-gray-600">
                                Yes! TrueSpend uses Supabase for secure data storage with encryption. Your data is private and only accessible to you. We never connect directly to your bank accounts.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I import from multiple banks?</h4>
                            <p className="text-gray-600">
                                Absolutely! You can create multiple accounts and import CSV files from different banks. Each import can be assigned to a specific account.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What if I import the same file twice?</h4>
                            <p className="text-gray-600">
                                TrueSpend automatically detects and prevents duplicate transactions. You can safely re-import files without creating duplicates.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I export my data?</h4>
                            <p className="text-gray-600">
                                Data export functionality is coming soon. For now, your data is securely stored in Supabase.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">How do I delete my account?</h4>
                            <p className="text-gray-600">
                                Account deletion is available in Settings (coming soon). Contact support if you need immediate assistance.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What CSV formats are supported?</h4>
                            <p className="text-gray-600">
                                TrueSpend supports standard CSV files with headers. The column mapping feature allows you to match your bank&apos;s CSV format to TrueSpend&apos;s fields.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I track multiple currencies?</h4>
                            <p className="text-gray-600">
                                Currently, TrueSpend displays all amounts in USD ($). Multi-currency support is planned for a future update.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'contact',
            title: 'Contact & Support',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Need help? We&apos;re here to assist you!
                    </p>
                    
                    <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Email Support</h4>
                            <p className="text-blue-700">
                                <a href="mailto:support@truespend.com" className="underline hover:text-blue-900">
                                    support@truespend.com
                                </a>
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                We typically respond within 24-48 hours
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Feature Requests</h4>
                            <p className="text-gray-600">
                                Have an idea for a new feature? We&apos;d love to hear from you! Send your suggestions to our support email.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Bug Reports</h4>
                            <p className="text-gray-600">
                                If you encounter any issues, please report them with as much detail as possible including:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
                                <li>What you were trying to do</li>
                                <li>What happened instead</li>
                                <li>Browser and device information</li>
                                <li>Screenshots (if applicable)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Everything you need to know about using TrueSpend
                </p>
            </div>
            
            <div className="space-y-3">

                {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                        <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                            openSection === section.id ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {openSection === section.id && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        {section.content}
                    </div>
                    )}

                </div>
                ))}

            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                    <p>TrueSpend Version {version}</p>
                    <p className="mt-1">© {new Date().getFullYear()} TrueSpend. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
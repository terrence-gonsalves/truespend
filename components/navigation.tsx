'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';

export function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Transactions', href: '/transactions' },
        { name: 'Categories', href: '/categories' },
        { name: 'Budgets', href: '/budgets' },
        { name: 'Import', href: '/import' },
        { name: 'Help', href: '/help' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                            TrueSpend
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex md:items-center md:space-x-8">

                        {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`${
                            isActive(item.href)
                                ? 'border-blue-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors`}
                        >
                            {item.name}
                        </Link>
                        ))}

                        <LogoutButton />
                    </div>
                    
                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                            <span className="sr-only">Open main menu</span>

                            {mobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            )}
                            
                        </button>
                    </div>
                </div>
            </div>
            
            {mobileMenuOpen && (
            <div className="md:hidden">
                <div className="space-y-1 pb-3 pt-2">

                    {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`${
                        isActive(item.href)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                        } block border-l-4 py-2 pl-3 pr-4 text-base font-medium`}
                    >
                        {item.name}
                    </Link>
                    ))}

                    <div className="border-t border-gray-200 pt-4 pb-3">
                        <div className="px-4">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
            )}
        </nav>
    );
}
'use client';

import { Home, LogOut, Moon, ShieldCheck, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useDarkMode } from '@/hooks/useDarkMode';
import { authClient } from '@/lib/auth-client';
import { useNameFormat } from '@/lib/nameFormatContext';

const iconClass = 'text-blue-600 dark:text-teal-400 shrink-0';

export function NavShell({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, toggleDark] = useDarkMode();
    const [format, toggleFormat] = useNameFormat();

    const links = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/employees', label: 'Employees' },
        { href: '/teams', label: 'Teams' },
        ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
    ];

    async function handleSignOut() {
        await authClient.signOut();
        router.push('/login');
    }

    return (
        <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                <nav className="flex items-center gap-6">
                    <span className="mr-2 font-semibold text-gray-900 dark:text-gray-100">Domain Manager</span>
                    {links.map(({ href, label, icon: Icon }) => {
                        const active =
                            href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1.5 text-sm ${
                                    active
                                        ? 'font-medium text-blue-600 dark:text-teal-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                                }`}
                            >
                                {Icon && <Icon size={16} className={iconClass} />}
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleFormat}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <User size={16} className={iconClass} />
                        <span className="hidden sm:inline">{format === 'FL' ? 'Last, First' : 'First Last'}</span>
                    </button>
                    <button
                        onClick={toggleDark}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun size={16} className={iconClass} /> : <Moon size={16} className={iconClass} />}
                        <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
                    </button>
                    {!isAdmin && (
                        <Link
                            href="/request-admin"
                            className={`text-sm ${
                                pathname === '/request-admin'
                                    ? 'font-medium text-blue-600 dark:text-teal-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Request Admin
                        </Link>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <LogOut size={16} className={iconClass} />
                        <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

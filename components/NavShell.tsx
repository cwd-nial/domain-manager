"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useDarkMode } from "@/hooks/useDarkMode";
import { authClient } from "@/lib/auth-client";
import { useNameFormat } from "@/lib/nameFormatContext";

export function NavShell({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, toggleDark] = useDarkMode();
    const [format, toggleFormat] = useNameFormat();

    const links = [
        { href: "/", label: "Home" },
        { href: "/employees", label: "Employees" },
        { href: "/teams", label: "Teams" },
        ...(isAdmin ? [{ href: "/admin", label: "⚙ Admin" }] : []),
    ];

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/login");
    }

    return (
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <nav className="flex items-center gap-6">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                        Domain Manager
                    </span>
                    {links.map(({ href, label }) => {
                        const active =
                            href === "/"
                                ? pathname === "/"
                                : pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`text-sm ${
                                    active
                                        ? "text-blue-600 dark:text-teal-400 font-medium"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleFormat}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        {format === "FL" ? "Last, First" : "First Last"}
                    </button>
                    <button
                        onClick={toggleDark}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? "☀ Light" : "☾ Dark"}
                    </button>
                    {!isAdmin && (
                        <Link
                            href="/request-admin"
                            className={`text-sm ${
                                pathname === "/request-admin"
                                    ? "text-blue-600 dark:text-teal-400 font-medium"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                        >
                            Request Admin
                        </Link>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    );
}

'use client';

import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { BadgeGroup } from '@/components/BadgeGroup';
import { formatName, sortKey } from '@/lib/formatName';
import { useNameFormat } from '@/lib/nameFormatContext';

type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    roleNames: string[];
    positionNames: string[];
};

export function EmployeeListClient({ employees }: { employees: Employee[] }) {
    const [format] = useNameFormat();
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const sorted = useMemo(
        () =>
            [...employees].sort((a, b) => {
                const cmp = sortKey(a.firstName, a.lastName, format).localeCompare(
                    sortKey(b.firstName, b.lastName, format)
                );
                return sortDir === 'asc' ? cmp : -cmp;
            }),
        [employees, format, sortDir]
    );

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <span>Name</span>
                                <button
                                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                                    className="rounded bg-gray-200 p-0.5 text-gray-600 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                    title={sortDir === 'asc' ? 'Sorted A → Z' : 'Sorted Z → A'}
                                >
                                    <ArrowDown
                                        size={14}
                                        className={`transition-transform duration-200 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            </div>
                        </th>
                        <th className="hidden px-4 py-3 text-left font-medium text-gray-700 sm:table-cell dark:text-gray-300">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Roles</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Positions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic dark:text-gray-500">
                                No employees yet —{' '}
                                <Link
                                    href="/employees/new"
                                    className="text-blue-600 hover:underline dark:text-teal-400"
                                >
                                    add one
                                </Link>
                            </td>
                        </tr>
                    ) : (
                        sorted.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/employees/${emp.id}`}
                                        className="font-medium text-blue-600 hover:underline dark:text-teal-400"
                                    >
                                        {formatName(emp.firstName, emp.lastName, format)}
                                    </Link>
                                </td>
                                <td className="hidden px-4 py-3 text-gray-600 sm:table-cell dark:text-gray-400">
                                    {emp.email ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <BadgeGroup items={emp.roleNames} variant="role" />
                                </td>
                                <td className="px-4 py-3">
                                    <BadgeGroup items={emp.positionNames} variant="position" />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

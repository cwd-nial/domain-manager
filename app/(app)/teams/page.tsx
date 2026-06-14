import Link from 'next/link';

import { buttonCls } from '@/components/ui/Button';
import { teams, employeeTeams } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getIsAdmin, requireAuth } from '@/lib/session';

export default async function TeamsPage() {
    const [isAdmin] = await Promise.all([getIsAdmin(), requireAuth()]);
    const [allTeams, allEmpTeams] = await Promise.all([db.select().from(teams), db.select().from(employeeTeams)]);

    const memberCountById = new Map<string, number>();
    for (const et of allEmpTeams) {
        memberCountById.set(et.teamId, (memberCountById.get(et.teamId) ?? 0) + 1);
    }

    const enriched = allTeams.map((t) => ({
        ...t,
        memberCount: memberCountById.get(t.id) ?? 0,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
                {isAdmin && (
                    <Link href="/teams/new" className={buttonCls()}>
                        + New Team
                    </Link>
                )}
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                Members
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {enriched.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-10 text-center text-gray-400 italic dark:text-gray-500"
                                >
                                    {isAdmin ? (
                                        <>
                                            No teams yet —{' '}
                                            <Link href="/teams/new" className="link-primary">
                                                add one
                                            </Link>
                                        </>
                                    ) : (
                                        'No teams yet'
                                    )}
                                </td>
                            </tr>
                        ) : (
                            enriched.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3">
                                        <Link href={`/teams/${t.id}`} className="link-primary font-medium">
                                            {t.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {t.description ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.memberCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeleteButton } from '@/components/DeleteButton';
import { teams, employeeTeams, employees } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getIsAdmin, requireAuth } from '@/lib/session';

type PageProps = { params: Promise<{ id: string }> };

export default async function TeamDetailPage({ params }: PageProps) {
    const [isAdmin, { id }] = await Promise.all([getIsAdmin(), params]);
    await requireAuth();

    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    if (!team) notFound();

    const [members, subTeams, parentRows] = await Promise.all([
        db
            .select({
                id: employees.id,
                firstName: employees.firstName,
                lastName: employees.lastName,
                email: employees.email,
            })
            .from(employees)
            .innerJoin(employeeTeams, eq(employees.id, employeeTeams.employeeId))
            .where(eq(employeeTeams.teamId, id)),
        db.select().from(teams).where(eq(teams.parentId, id)),
        team.parentId
            ? db.select({ name: teams.name }).from(teams).where(eq(teams.id, team.parentId))
            : Promise.resolve([] as { name: string }[]),
    ]);

    const parentName = parentRows[0]?.name ?? null;

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team.name}</h1>
                    {team.description && (
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{team.description}</p>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Link
                            href={`/teams/${id}/edit`}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Edit
                        </Link>
                        <DeleteButton url={`/api/teams/${id}`} redirectTo="/teams" label="Delete" />
                    </div>
                )}
            </div>

            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                {team.parentId && (
                    <Row label="Parent Team">
                        <Link
                            href={`/teams/${team.parentId}`}
                            className="text-sm text-blue-600 hover:underline dark:text-teal-400"
                        >
                            {parentName ?? team.parentId}
                        </Link>
                    </Row>
                )}
                <Row label="Members">
                    {members.length > 0 ? (
                        <ul className="m-0 list-none space-y-1 p-0">
                            {members.map((m) => (
                                <li key={m.id} className="flex items-center gap-2">
                                    <Link
                                        href={`/employees/${m.id}`}
                                        className="text-sm font-medium text-blue-600 hover:underline dark:text-teal-400"
                                    >
                                        {`${m.firstName} ${m.lastName}`.trim()}
                                    </Link>
                                    {m.email && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{m.email}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">No members</span>
                    )}
                </Row>
                {subTeams.length > 0 && (
                    <Row label="Sub-teams">
                        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                            {subTeams.map((s) => (
                                <li key={s.id}>
                                    <Link
                                        href={`/teams/${s.id}`}
                                        className="text-sm text-blue-600 hover:underline dark:text-teal-400"
                                    >
                                        {s.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Row>
                )}
            </div>

            <Link href="/teams" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                ← Back to Teams
            </Link>
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4 px-4 py-3">
            <span className="w-28 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <div className="flex-1">{children}</div>
        </div>
    );
}

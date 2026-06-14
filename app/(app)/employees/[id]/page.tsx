import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BadgeGroup } from '@/components/BadgeGroup';
import { DeleteButton } from '@/components/DeleteButton';
import { FormattedName } from '@/components/FormattedName';
import { buttonCls } from '@/components/ui/Button';
import { employees, employeeRoles, employeePositions, employeeTeams, roles, positions, teams } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getIsAdmin, requireAuth } from '@/lib/session';

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployeeDetailPage({ params }: PageProps) {
    const [isAdmin, { id }] = await Promise.all([getIsAdmin(), params]);
    await requireAuth();

    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) notFound();

    const [roleNames, positionNames, empTeamList, managerRows, reports] = await Promise.all([
        db
            .select({ name: roles.name })
            .from(roles)
            .innerJoin(employeeRoles, eq(roles.id, employeeRoles.roleId))
            .where(eq(employeeRoles.employeeId, id))
            .then((rows) => rows.map((r) => r.name)),
        db
            .select({ name: positions.name })
            .from(positions)
            .innerJoin(employeePositions, eq(positions.id, employeePositions.positionId))
            .where(eq(employeePositions.employeeId, id))
            .then((rows) => rows.map((r) => r.name)),
        db
            .select({ id: teams.id, name: teams.name })
            .from(teams)
            .innerJoin(employeeTeams, eq(teams.id, employeeTeams.teamId))
            .where(eq(employeeTeams.employeeId, id)),
        emp.managerId
            ? db
                  .select({ firstName: employees.firstName, lastName: employees.lastName })
                  .from(employees)
                  .where(eq(employees.id, emp.managerId))
            : Promise.resolve([] as { firstName: string; lastName: string }[]),
        db
            .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
            .from(employees)
            .where(eq(employees.managerId, id)),
    ]);

    const managerName = managerRows[0]
        ? `${managerRows[0].firstName} ${managerRows[0].lastName}`.trim()
        : null;

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        <FormattedName firstName={emp.firstName} lastName={emp.lastName} />
                    </h1>
                    {emp.email && <p className="secondary-text mt-0.5">{emp.email}</p>}
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Link href={`/employees/${id}/edit`} className={buttonCls('secondary')}>
                            Edit
                        </Link>
                        <DeleteButton url={`/api/employees/${id}`} redirectTo="/employees" label="Delete" />
                    </div>
                )}
            </div>

            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                {emp.phone && (
                    <Row label="Phone">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{emp.phone}</span>
                    </Row>
                )}
                <Row label="Manager">
                    {emp.managerId && managerName ? (
                        <Link href={`/employees/${emp.managerId}`} className="link-primary text-sm">
                            {managerName}
                        </Link>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </Row>
                <Row label="Roles">
                    {roleNames.length > 0 ? (
                        <BadgeGroup items={roleNames} variant="role" />
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </Row>
                <Row label="Positions">
                    {positionNames.length > 0 ? (
                        <BadgeGroup items={positionNames} variant="position" />
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </Row>
                <Row label="Teams">
                    {empTeamList.length > 0 ? (
                        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
                            {empTeamList.map((t) => (
                                <li key={t.id}>
                                    <Link href={`/teams/${t.id}`} className="link-primary text-sm">
                                        {t.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </Row>
                {reports.length > 0 && (
                    <Row label="Direct Reports">
                        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                            {reports.map((r) => (
                                <li key={r.id}>
                                    <Link href={`/employees/${r.id}`} className="link-primary text-sm">
                                        <FormattedName firstName={r.firstName} lastName={r.lastName} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Row>
                )}
            </div>

            <Link href="/employees" className="secondary-text hover:underline">
                ← Back to Employees
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

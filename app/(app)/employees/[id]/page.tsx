import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeePositions,
  employeeTeams,
  roles,
  positions,
  teams,
} from "@/drizzle/schema";
import { BadgeGroup } from "@/components/BadgeGroup";
import { DeleteButton } from "@/components/DeleteButton";
import { FormattedName } from "@/components/FormattedName";

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployeeDetailPage({ params }: PageProps) {
  await requireAuth();
  const { id } = await params;

  const [emp] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));
  if (!emp) notFound();

  const [
    empRoles,
    empPositions,
    empTeams,
    allRoles,
    allPositions,
    allTeams,
    allEmps,
    reports,
  ] = await Promise.all([
    db.select().from(employeeRoles).where(eq(employeeRoles.employeeId, id)),
    db
      .select()
      .from(employeePositions)
      .where(eq(employeePositions.employeeId, id)),
    db.select().from(employeeTeams).where(eq(employeeTeams.employeeId, id)),
    db.select().from(roles),
    db.select().from(positions),
    db.select().from(teams),
    db
      .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
      .from(employees),
    db
      .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
      .from(employees)
      .where(eq(employees.managerId, id)),
  ]);

  const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
  const positionsById = Object.fromEntries(
    allPositions.map((p) => [p.id, p.name]),
  );
  const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t.name]));
  const empById = Object.fromEntries(
    allEmps.map((e) => [e.id, `${e.firstName} ${e.lastName}`.trim()]),
  );

  const roleNames = empRoles.map((er) => rolesById[er.roleId] ?? "");
  const positionNames = empPositions.map(
    (ep) => positionsById[ep.positionId] ?? "",
  );
  const empTeamList = empTeams.map((et) => ({
    id: et.teamId,
    name: teamsById[et.teamId] ?? "",
  }));
  const managerName = emp.managerId ? empById[emp.managerId] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            <FormattedName
              firstName={emp.firstName}
              lastName={emp.lastName}
            />
          </h1>
          {emp.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {emp.email}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/employees/${id}/edit`}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Edit
          </Link>
          <DeleteButton
            url={`/api/employees/${id}`}
            redirectTo="/employees"
            label="Delete"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {emp.phone && (
          <Row label="Phone">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {emp.phone}
            </span>
          </Row>
        )}
        <Row label="Manager">
          {emp.managerId && managerName ? (
            <Link
              href={`/employees/${emp.managerId}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
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
            <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
              {empTeamList.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/teams/${t.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
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
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/employees/${r.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FormattedName
                      firstName={r.firstName}
                      lastName={r.lastName}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Row>
        )}
      </div>

      <Link
        href="/employees"
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
      >
        ← Back to Employees
      </Link>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <span className="w-28 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

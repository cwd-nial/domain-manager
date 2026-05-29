import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { teams, employeeTeams, employees } from "@/drizzle/schema";
import { DeleteButton } from "@/components/DeleteButton";

type PageProps = { params: Promise<{ id: string }> };

export default async function TeamDetailPage({ params }: PageProps) {
  await requireAuth();
  const { id } = await params;

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) notFound();

  const [empTeamRows, subTeams, allTeams, allEmps] = await Promise.all([
    db.select().from(employeeTeams).where(eq(employeeTeams.teamId, id)),
    db.select().from(teams).where(eq(teams.parentId, id)),
    db.select({ id: teams.id, name: teams.name }).from(teams),
    db
      .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName, email: employees.email })
      .from(employees),
  ]);

  const memberIds = new Set(empTeamRows.map((et) => et.employeeId));
  const members = allEmps.filter((e) => memberIds.has(e.id));
  const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t.name]));
  const parentName = team.parentId ? teamsById[team.parentId] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {team.name}
          </h1>
          {team.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {team.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/teams/${id}/edit`}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Edit
          </Link>
          <DeleteButton
            url={`/api/teams/${id}`}
            redirectTo="/teams"
            label="Delete"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {team.parentId && (
          <Row label="Parent Team">
            <Link
              href={`/teams/${team.parentId}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {parentName ?? team.parentId}
            </Link>
          </Row>
        )}
        <Row label="Members">
          {members.length > 0 ? (
            <ul className="space-y-1 list-none p-0 m-0">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <Link
                    href={`/employees/${m.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {`${m.firstName} ${m.lastName}`.trim()}
                  </Link>
                  {m.email && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {m.email}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              No members
            </span>
          )}
        </Row>
        {subTeams.length > 0 && (
          <Row label="Sub-teams">
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {subTeams.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/teams/${s.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Row>
        )}
      </div>

      <Link
        href="/teams"
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
      >
        ← Back to Teams
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

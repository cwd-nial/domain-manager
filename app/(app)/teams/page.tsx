import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { teams, employeeTeams } from "@/drizzle/schema";

export default async function TeamsPage() {
  await requireAuth();
  const [allTeams, allEmpTeams] = await Promise.all([
    db.select().from(teams),
    db.select().from(employeeTeams),
  ]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Teams
        </h1>
        <Link
          href="/teams/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Team
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Description
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Members
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {enriched.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 italic"
                >
                  No teams yet —{" "}
                  <Link
                    href="/teams/new"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    add one
                  </Link>
                </td>
              </tr>
            ) : (
              enriched.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/teams/${t.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {t.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {t.memberCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

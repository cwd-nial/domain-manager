import Link from "next/link";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeePositions,
  roles,
  positions,
} from "@/drizzle/schema";
import { BadgeGroup } from "@/components/BadgeGroup";

export default async function EmployeesPage() {
  const [allEmps, allEmpRoles, allEmpPositions, allRoles, allPositions] =
    await Promise.all([
      db.select().from(employees),
      db.select().from(employeeRoles),
      db.select().from(employeePositions),
      db.select().from(roles),
      db.select().from(positions),
    ]);

  const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
  const positionsById = Object.fromEntries(
    allPositions.map((p) => [p.id, p.name]),
  );

  const enriched = allEmps.map((emp) => ({
    ...emp,
    roleNames: allEmpRoles
      .filter((er) => er.employeeId === emp.id)
      .map((er) => rolesById[er.roleId] ?? ""),
    positionNames: allEmpPositions
      .filter((ep) => ep.employeeId === emp.id)
      .map((ep) => positionsById[ep.positionId] ?? ""),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Link
          href="/employees/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Employee
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Roles
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Positions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enriched.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-400 italic"
                >
                  No employees yet —{" "}
                  <Link
                    href="/employees/new"
                    className="text-blue-600 hover:underline"
                  >
                    add one
                  </Link>
                </td>
              </tr>
            ) : (
              enriched.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {emp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {emp.email ?? "—"}
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
    </div>
  );
}

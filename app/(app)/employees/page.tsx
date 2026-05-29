import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeePositions,
  roles,
  positions,
} from "@/drizzle/schema";
import { EmployeeListClient } from "./EmployeeListClient";

export default async function EmployeesPage() {
  await requireAuth();
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
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Employees
        </h1>
        <Link
          href="/employees/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Employee
        </Link>
      </div>
      <EmployeeListClient employees={enriched} />
    </div>
  );
}

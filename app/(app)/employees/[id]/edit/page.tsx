import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/EmployeeForm";
import { FormattedName } from "@/components/FormattedName";
import {
  employees,
  employeeRoles,
  employeePositions,
  employeeTeams,
  roles,
  positions,
  teams,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEmployeePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [emp] = await db.select().from(employees).where(eq(employees.id, id));
  if (!emp) notFound();

  const [empRoles, empPositions, empTeams, allRoles, allPositions, allTeams, allEmployees] =
    await Promise.all([
      db.select().from(employeeRoles).where(eq(employeeRoles.employeeId, id)),
      db.select().from(employeePositions).where(eq(employeePositions.employeeId, id)),
      db.select().from(employeeTeams).where(eq(employeeTeams.employeeId, id)),
      db.select().from(roles),
      db.select().from(positions),
      db.select().from(teams),
      db
        .select({
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
        })
        .from(employees),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Edit — <FormattedName firstName={emp.firstName} lastName={emp.lastName} />
      </h1>
      <EmployeeForm
        roles={allRoles}
        positions={allPositions}
        teams={allTeams}
        employees={allEmployees.map((e) => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`.trim(),
        }))}
        defaultValues={{
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email ?? "",
          phone: emp.phone ?? "",
          avatarUrl: emp.avatarUrl ?? "",
          managerId: emp.managerId ?? "",
          roleIds: empRoles.map((er) => er.roleId),
          positionIds: empPositions.map((ep) => ep.positionId),
          teamIds: empTeams.map((et) => et.teamId),
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
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
import { EmployeeForm } from "@/components/EmployeeForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEmployeePage({ params }: PageProps) {
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
    allEmployees,
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
      .select({ id: employees.id, name: employees.name })
      .from(employees),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Edit — {emp.name}
      </h1>
      <EmployeeForm
        roles={allRoles}
        positions={allPositions}
        teams={allTeams}
        employees={allEmployees}
        defaultValues={{
          id: emp.id,
          name: emp.name,
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

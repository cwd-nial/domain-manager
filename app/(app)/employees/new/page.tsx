import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { employees, roles, positions, teams } from "@/drizzle/schema";
import { EmployeeForm } from "@/components/EmployeeForm";

export default async function NewEmployeePage() {
  await requireAuth();
  const [allRoles, allPositions, allTeams, allEmployees] = await Promise.all([
    db.select().from(roles),
    db.select().from(positions),
    db.select().from(teams),
    db
      .select({ id: employees.id, name: employees.name })
      .from(employees),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Employee</h1>
      <EmployeeForm
        roles={allRoles}
        positions={allPositions}
        teams={allTeams}
        employees={allEmployees}
      />
    </div>
  );
}

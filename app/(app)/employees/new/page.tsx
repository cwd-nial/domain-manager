import { EmployeeForm } from "@/components/EmployeeForm";
import { employees, roles, positions, teams } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export default async function NewEmployeePage() {
    await requireAuth();
    const [allRoles, allPositions, allTeams, allEmps] = await Promise.all([
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

    const allEmployees = allEmps.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`.trim(),
    }));

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

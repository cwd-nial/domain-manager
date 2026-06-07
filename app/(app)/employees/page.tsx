import Link from 'next/link';

import { employees, employeeRoles, employeePositions, roles, positions } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getIsAdmin, requireAuth } from '@/lib/session';

import { EmployeeListClient } from './EmployeeListClient';

export default async function EmployeesPage() {
    const [isAdmin] = await Promise.all([getIsAdmin(), requireAuth()]);
    const [allEmps, allEmpRoles, allEmpPositions, allRoles, allPositions] = await Promise.all([
        db.select().from(employees),
        db.select().from(employeeRoles),
        db.select().from(employeePositions),
        db.select().from(roles),
        db.select().from(positions),
    ]);

    const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
    const positionsById = Object.fromEntries(allPositions.map((p) => [p.id, p.name]));

    const empRolesMap = new Map<string, typeof allEmpRoles>();
    for (const er of allEmpRoles) {
        const b = empRolesMap.get(er.employeeId);
        if (b) b.push(er); else empRolesMap.set(er.employeeId, [er]);
    }
    const empPositionsMap = new Map<string, typeof allEmpPositions>();
    for (const ep of allEmpPositions) {
        const b = empPositionsMap.get(ep.employeeId);
        if (b) b.push(ep); else empPositionsMap.set(ep.employeeId, [ep]);
    }

    const enriched = allEmps.map((emp) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        roleNames: (empRolesMap.get(emp.id) ?? []).map((er) => rolesById[er.roleId] ?? ''),
        positionNames: (empPositionsMap.get(emp.id) ?? []).map((ep) => positionsById[ep.positionId] ?? ''),
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
                {isAdmin && (
                    <Link
                        href="/employees/new"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        + New Employee
                    </Link>
                )}
            </div>
            <EmployeeListClient employees={enriched} />
        </div>
    );
}

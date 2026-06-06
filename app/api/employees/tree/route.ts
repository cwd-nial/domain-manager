import { NextResponse } from 'next/server';

import { employees, employeeRoles, employeePositions, roles, positions } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

type EmployeeNode = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    roles: { id: string; name: string }[];
    positions: { id: string; name: string }[];
    children: EmployeeNode[];
};

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [allEmps, allEmpRoles, allEmpPositions, allRoles, allPositions] = await Promise.all([
        db.select().from(employees),
        db.select().from(employeeRoles),
        db.select().from(employeePositions),
        db.select().from(roles),
        db.select().from(positions),
    ]);

    const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
    const positionsById = Object.fromEntries(allPositions.map((p) => [p.id, p.name]));

    const nodes = new Map<string, EmployeeNode>(
        allEmps.map((e) => [
            e.id,
            {
                id: e.id,
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                roles: allEmpRoles
                    .filter((er) => er.employeeId === e.id)
                    .map((er) => ({ id: er.roleId, name: rolesById[er.roleId] ?? '' })),
                positions: allEmpPositions
                    .filter((ep) => ep.employeeId === e.id)
                    .map((ep) => ({
                        id: ep.positionId,
                        name: positionsById[ep.positionId] ?? '',
                    })),
                children: [],
            },
        ])
    );

    const roots: EmployeeNode[] = [];
    for (const emp of allEmps) {
        const node = nodes.get(emp.id)!;
        if (emp.managerId && nodes.has(emp.managerId)) {
            nodes.get(emp.managerId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return NextResponse.json(roots);
}

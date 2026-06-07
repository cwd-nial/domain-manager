import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { employees, employeeRoles, employeePositions, employeeTeams, roles, positions, teams } from '@/drizzle/schema';
import { wouldCreateCycle } from '@/lib/cycles';
import { db } from '@/lib/db';
import { checkIsAdmin, getSession } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [empRoleRows, empPositionRows, empTeamRows, managerRows, reports] = await Promise.all([
        db
            .select({ id: roles.id, name: roles.name })
            .from(roles)
            .innerJoin(employeeRoles, eq(roles.id, employeeRoles.roleId))
            .where(eq(employeeRoles.employeeId, id)),
        db
            .select({ id: positions.id, name: positions.name })
            .from(positions)
            .innerJoin(employeePositions, eq(positions.id, employeePositions.positionId))
            .where(eq(employeePositions.employeeId, id)),
        db
            .select({ id: teams.id, name: teams.name })
            .from(teams)
            .innerJoin(employeeTeams, eq(teams.id, employeeTeams.teamId))
            .where(eq(employeeTeams.employeeId, id)),
        emp.managerId
            ? db
                  .select({ firstName: employees.firstName, lastName: employees.lastName })
                  .from(employees)
                  .where(eq(employees.id, emp.managerId))
            : Promise.resolve([] as { firstName: string; lastName: string }[]),
        db
            .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
            .from(employees)
            .where(eq(employees.managerId, id)),
    ]);

    const managerName = managerRows[0]
        ? `${managerRows[0].firstName} ${managerRows[0].lastName}`.trim()
        : null;

    return NextResponse.json({
        ...emp,
        managerName,
        roles: empRoleRows,
        positions: empPositionRows,
        teams: empTeamRows,
        reports,
    });
}

export async function PUT(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName = '', email, phone, avatarUrl, managerId, roleIds, positionIds, teamIds } = body;

    if (!firstName?.trim()) {
        return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    if (managerId) {
        const allEmps = await db.select({ id: employees.id, managerId: employees.managerId }).from(employees);
        const managerMap = Object.fromEntries(allEmps.map((e) => [e.id, e.managerId ?? null]));
        if (wouldCreateCycle(id, managerId, managerMap)) {
            return NextResponse.json({ error: 'Cycle detected in manager hierarchy' }, { status: 400 });
        }
    }

    await db.transaction(async (tx) => {
        await tx
            .update(employees)
            .set({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email || null,
                phone: phone || null,
                avatarUrl: avatarUrl || null,
                managerId: managerId || null,
                updatedAt: new Date(),
            })
            .where(eq(employees.id, id));

        if (roleIds !== undefined) {
            await tx.delete(employeeRoles).where(eq(employeeRoles.employeeId, id));
            if (roleIds.length > 0) {
                await tx.insert(employeeRoles).values(roleIds.map((roleId: string) => ({ employeeId: id, roleId })));
            }
        }

        if (positionIds !== undefined) {
            await tx.delete(employeePositions).where(eq(employeePositions.employeeId, id));
            if (positionIds.length > 0) {
                await tx.insert(employeePositions).values(
                    positionIds.map((positionId: string) => ({
                        employeeId: id,
                        positionId,
                    }))
                );
            }
        }

        if (teamIds !== undefined) {
            await tx.delete(employeeTeams).where(eq(employeeTeams.employeeId, id));
            if (teamIds.length > 0) {
                await tx.insert(employeeTeams).values(teamIds.map((teamId: string) => ({ employeeId: id, teamId })));
            }
        }
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const [report] = await db.select({ id: employees.id }).from(employees).where(eq(employees.managerId, id)).limit(1);

    if (report) {
        return NextResponse.json({ error: 'Cannot delete: employee has direct reports' }, { status: 400 });
    }

    await db.delete(employees).where(eq(employees.id, id));
    return NextResponse.json({ success: true });
}

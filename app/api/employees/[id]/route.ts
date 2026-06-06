import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
import { wouldCreateCycle } from "@/lib/cycles";
import { checkIsAdmin, getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [empRoles, empPositions, empTeams, allRoles, allPositions, allTeams, allEmps, reports] =
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
            db
                .select({
                    id: employees.id,
                    firstName: employees.firstName,
                    lastName: employees.lastName,
                })
                .from(employees)
                .where(eq(employees.managerId, id)),
        ]);

    const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
    const positionsById = Object.fromEntries(allPositions.map((p) => [p.id, p.name]));
    const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t.name]));
    const empById = Object.fromEntries(
        allEmps.map((e) => [e.id, `${e.firstName} ${e.lastName}`.trim()]),
    );

    return NextResponse.json({
        ...emp,
        managerName: emp.managerId ? (empById[emp.managerId] ?? null) : null,
        roles: empRoles.map((er) => ({
            id: er.roleId,
            name: rolesById[er.roleId] ?? "",
        })),
        positions: empPositions.map((ep) => ({
            id: ep.positionId,
            name: positionsById[ep.positionId] ?? "",
        })),
        teams: empTeams.map((et) => ({
            id: et.teamId,
            name: teamsById[et.teamId] ?? "",
        })),
        reports,
    });
}

export async function PUT(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const {
        firstName,
        lastName = "",
        email,
        phone,
        avatarUrl,
        managerId,
        roleIds,
        positionIds,
        teamIds,
    } = body;

    if (!firstName?.trim()) {
        return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }

    if (managerId) {
        const allEmps = await db
            .select({ id: employees.id, managerId: employees.managerId })
            .from(employees);
        const managerMap = Object.fromEntries(allEmps.map((e) => [e.id, e.managerId ?? null]));
        if (wouldCreateCycle(id, managerId, managerMap)) {
            return NextResponse.json(
                { error: "Cycle detected in manager hierarchy" },
                { status: 400 },
            );
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
                await tx
                    .insert(employeeRoles)
                    .values(roleIds.map((roleId: string) => ({ employeeId: id, roleId })));
            }
        }

        if (positionIds !== undefined) {
            await tx.delete(employeePositions).where(eq(employeePositions.employeeId, id));
            if (positionIds.length > 0) {
                await tx.insert(employeePositions).values(
                    positionIds.map((positionId: string) => ({
                        employeeId: id,
                        positionId,
                    })),
                );
            }
        }

        if (teamIds !== undefined) {
            await tx.delete(employeeTeams).where(eq(employeeTeams.employeeId, id));
            if (teamIds.length > 0) {
                await tx
                    .insert(employeeTeams)
                    .values(teamIds.map((teamId: string) => ({ employeeId: id, teamId })));
            }
        }
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const [report] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.managerId, id))
        .limit(1);

    if (report) {
        return NextResponse.json(
            { error: "Cannot delete: employee has direct reports" },
            { status: 400 },
        );
    }

    await db.delete(employees).where(eq(employees.id, id));
    return NextResponse.json({ success: true });
}

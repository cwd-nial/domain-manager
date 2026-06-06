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
import { checkIsAdmin, getSession } from "@/lib/session";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [allEmps, allEmpRoles, allEmpPositions, allEmpTeams, allRoles, allPositions, allTeams] =
        await Promise.all([
            db.select().from(employees),
            db.select().from(employeeRoles),
            db.select().from(employeePositions),
            db.select().from(employeeTeams),
            db.select().from(roles),
            db.select().from(positions),
            db.select().from(teams),
        ]);

    const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
    const positionsById = Object.fromEntries(allPositions.map((p) => [p.id, p.name]));
    const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t.name]));
    const empById = Object.fromEntries(
        allEmps.map((e) => [e.id, `${e.firstName} ${e.lastName}`.trim()]),
    );

    const result = allEmps.map((emp) => ({
        ...emp,
        managerName: emp.managerId ? (empById[emp.managerId] ?? null) : null,
        roles: allEmpRoles
            .filter((er) => er.employeeId === emp.id)
            .map((er) => ({ id: er.roleId, name: rolesById[er.roleId] ?? "" })),
        positions: allEmpPositions
            .filter((ep) => ep.employeeId === emp.id)
            .map((ep) => ({
                id: ep.positionId,
                name: positionsById[ep.positionId] ?? "",
            })),
        teams: allEmpTeams
            .filter((et) => et.employeeId === emp.id)
            .map((et) => ({ id: et.teamId, name: teamsById[et.teamId] ?? "" })),
    }));

    return NextResponse.json(result);
}

export async function POST(request: Request) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
        firstName,
        lastName = "",
        email,
        phone,
        avatarUrl,
        managerId,
        roleIds = [],
        positionIds = [],
        teamIds = [],
    } = body;

    if (!firstName?.trim()) {
        return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.transaction(async (tx) => {
        await tx.insert(employees).values({
            id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email || null,
            phone: phone || null,
            avatarUrl: avatarUrl || null,
            managerId: managerId || null,
            createdAt: now,
            updatedAt: now,
        });

        if (roleIds.length > 0) {
            await tx
                .insert(employeeRoles)
                .values(roleIds.map((roleId: string) => ({ employeeId: id, roleId })));
        }
        if (positionIds.length > 0) {
            await tx
                .insert(employeePositions)
                .values(positionIds.map((positionId: string) => ({ employeeId: id, positionId })));
        }
        if (teamIds.length > 0) {
            await tx
                .insert(employeeTeams)
                .values(teamIds.map((teamId: string) => ({ employeeId: id, teamId })));
        }
    });

    return NextResponse.json({ id }, { status: 201 });
}

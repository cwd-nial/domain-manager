import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { teams, employeeTeams, employees } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { wouldCreateCycle } from "@/lib/cycles";
import { checkIsAdmin, getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [empTeamRows, subTeams, allEmps] = await Promise.all([
        db.select().from(employeeTeams).where(eq(employeeTeams.teamId, id)),
        db.select().from(teams).where(eq(teams.parentId, id)),
        db
            .select({
                id: employees.id,
                firstName: employees.firstName,
                lastName: employees.lastName,
                email: employees.email,
            })
            .from(employees),
    ]);

    const memberIds = new Set(empTeamRows.map((et) => et.employeeId));
    const members = allEmps.filter((e) => memberIds.has(e.id));

    return NextResponse.json({ ...team, members, subTeams });
}

export async function PUT(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (parentId) {
        const allTeams = await db.select({ id: teams.id, parentId: teams.parentId }).from(teams);
        const parentMap = Object.fromEntries(allTeams.map((t) => [t.id, t.parentId ?? null]));
        if (wouldCreateCycle(id, parentId, parentMap)) {
            return NextResponse.json(
                { error: "Cycle detected in team hierarchy" },
                { status: 400 },
            );
        }
    }

    await db
        .update(teams)
        .set({
            name,
            description: description || null,
            parentId: parentId || null,
            updatedAt: new Date(),
        })
        .where(eq(teams.id, id));

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Params) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const [subTeam] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.parentId, id))
        .limit(1);

    if (subTeam) {
        return NextResponse.json({ error: "Cannot delete: team has sub-teams" }, { status: 400 });
    }

    await db.delete(teams).where(eq(teams.id, id));
    return NextResponse.json({ success: true });
}

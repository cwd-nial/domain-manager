import { NextResponse } from "next/server";

import { teams, employeeTeams } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [allTeams, allEmpTeams] = await Promise.all([
        db.select().from(teams),
        db.select().from(employeeTeams),
    ]);

    const memberCountById = new Map<string, number>();
    for (const et of allEmpTeams) {
        memberCountById.set(et.teamId, (memberCountById.get(et.teamId) ?? 0) + 1);
    }

    return NextResponse.json(
        allTeams.map((t) => ({ ...t, memberCount: memberCountById.get(t.id) ?? 0 })),
    );
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(teams).values({
        id,
        name,
        description: description || null,
        parentId: parentId || null,
        createdAt: now,
        updatedAt: now,
    });

    return NextResponse.json({ id }, { status: 201 });
}

import { NextResponse } from "next/server";

import { teams, employeeTeams, employees } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

type TeamNode = {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    members: { id: string; firstName: string; lastName: string }[];
    children: TeamNode[];
};

export async function GET() {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: "Unauthorized" },
            {
                status: 401,
            },
        );

    const [allTeams, allEmpTeams, allEmps] = await Promise.all([
        db.select().from(teams),
        db.select().from(employeeTeams),
        db
            .select({
                id: employees.id,
                firstName: employees.firstName,
                lastName: employees.lastName,
            })
            .from(employees),
    ]);

    const empById = Object.fromEntries(allEmps.map((e) => [e.id, e]));

    const nodes = new Map<string, TeamNode>(
        allTeams.map((t) => {
            const members = allEmpTeams
                .filter((et) => et.teamId === t.id)
                .map((et) => {
                    const emp = empById[et.employeeId];
                    return {
                        id: et.employeeId,
                        firstName: emp?.firstName ?? "",
                        lastName: emp?.lastName ?? "",
                    };
                });
            return [
                t.id,
                {
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    memberCount: members.length,
                    members,
                    children: [],
                },
            ];
        }),
    );

    const roots: TeamNode[] = [];
    for (const team of allTeams) {
        const node = nodes.get(team.id)!;
        if (team.parentId && nodes.has(team.parentId)) {
            nodes.get(team.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return NextResponse.json(roots);
}

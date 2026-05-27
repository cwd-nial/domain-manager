import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, employeeTeams, employees } from "@/drizzle/schema";

type TeamNode = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  members: { id: string; name: string }[];
  children: TeamNode[];
};

export async function GET() {
  const [allTeams, allEmpTeams, allEmps] = await Promise.all([
    db.select().from(teams),
    db.select().from(employeeTeams),
    db.select({ id: employees.id, name: employees.name }).from(employees),
  ]);

  const empById = Object.fromEntries(allEmps.map((e) => [e.id, e.name]));

  const nodes = new Map<string, TeamNode>(
    allTeams.map((t) => {
      const members = allEmpTeams
        .filter((et) => et.teamId === t.id)
        .map((et) => ({ id: et.employeeId, name: empById[et.employeeId] ?? "" }));
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

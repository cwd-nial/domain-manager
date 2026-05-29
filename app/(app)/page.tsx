import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeePositions,
  roles,
  positions,
  teams,
  employeeTeams,
} from "@/drizzle/schema";
import { HierarchyPanel } from "./HierarchyPanel";
import type { TreeNode } from "@/components/HierarchyTree";

async function buildEmployeeTree(): Promise<TreeNode[]> {
  const [allEmps, allEmpRoles, allEmpPositions, allRoles, allPositions] =
    await Promise.all([
      db.select().from(employees),
      db.select().from(employeeRoles),
      db.select().from(employeePositions),
      db.select().from(roles),
      db.select().from(positions),
    ]);

  const rolesById = Object.fromEntries(allRoles.map((r) => [r.id, r.name]));
  const positionsById = Object.fromEntries(
    allPositions.map((p) => [p.id, p.name]),
  );

  const nodes = new Map<string, TreeNode>(
    allEmps.map((e) => [
      e.id,
      {
        id: e.id,
        label: e.name,
        href: `/employees/${e.id}`,
        meta: [
          ...allEmpRoles
            .filter((er) => er.employeeId === e.id)
            .map((er) => rolesById[er.roleId] ?? ""),
          ...allEmpPositions
            .filter((ep) => ep.employeeId === e.id)
            .map((ep) => positionsById[ep.positionId] ?? ""),
        ],
        children: [],
      },
    ]),
  );

  const roots: TreeNode[] = [];
  for (const emp of allEmps) {
    const node = nodes.get(emp.id)!;
    if (emp.managerId && nodes.has(emp.managerId)) {
      nodes.get(emp.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

async function buildTeamTree(): Promise<TreeNode[]> {
  const [allTeams, allEmpTeams, allEmps] = await Promise.all([
    db.select().from(teams),
    db.select().from(employeeTeams),
    db
      .select({ id: employees.id, name: employees.name })
      .from(employees),
  ]);

  const empById = Object.fromEntries(allEmps.map((e) => [e.id, e.name]));

  const nodes = new Map<string, TreeNode>(
    allTeams.map((t) => {
      const members = allEmpTeams
        .filter((et) => et.teamId === t.id)
        .map((et) => empById[et.employeeId] ?? "")
        .filter(Boolean);
      return [
        t.id,
        {
          id: t.id,
          label: t.name,
          href: `/teams/${t.id}`,
          meta:
            members.length > 0
              ? [`${members.length} member${members.length !== 1 ? "s" : ""}`]
              : [],
          children: [],
        },
      ];
    }),
  );

  const roots: TreeNode[] = [];
  for (const team of allTeams) {
    const node = nodes.get(team.id)!;
    if (team.parentId && nodes.has(team.parentId)) {
      nodes.get(team.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export default async function HomePage() {
  await requireAuth();
  const [empTree, teamTree] = await Promise.all([
    buildEmployeeTree(),
    buildTeamTree(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Domain Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Team Hierarchy
          </h2>
          <HierarchyPanel nodes={teamTree} placeholder="Search teams…" />
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Employee Hierarchy
          </h2>
          <HierarchyPanel nodes={empTree} placeholder="Search employees…" />
        </section>
      </div>
    </div>
  );
}

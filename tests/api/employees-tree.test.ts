import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_SESSION, mockGetSession } from "../helpers/createMockSession";

const { queue } = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../helpers/createMockDb");
  return { db: createMockDb(queue) };
});

vi.mock("@/lib/session", () => ({ getSession: mockGetSession }));

vi.mock("@/drizzle/schema", () => ({
  employees: "employees",
  employeeRoles: "employeeRoles",
  employeePositions: "employeePositions",
  roles: "roles",
  positions: "positions",
}));

const { GET } = await import("@/app/api/employees/tree/route");

beforeEach(() => {
  queue.length = 0;
  mockGetSession.mockResolvedValue(MOCK_SESSION);
});

describe("GET /api/employees/tree", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty array when no employees", async () => {
    queue.push([], [], [], [], []);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("makes all null-manager employees top-level roots", async () => {
    const employees = [
      { id: "e1", firstName: "Alice", lastName: "Smith", email: null, managerId: null },
      { id: "e2", firstName: "Bob", lastName: "Jones", email: null, managerId: null },
    ];
    queue.push(employees, [], [], [], []);
    const res = await GET();
    const tree = await res.json();
    expect(tree).toHaveLength(2);
    expect(tree[0].children).toEqual([]);
  });

  it("nests children under their manager node", async () => {
    const employees = [
      { id: "e1", firstName: "Alice", lastName: "", email: null, managerId: null },
      { id: "e2", firstName: "Bob", lastName: "", email: null, managerId: "e1" },
      { id: "e3", firstName: "Carol", lastName: "", email: null, managerId: "e1" },
      { id: "e4", firstName: "Dave", lastName: "", email: null, managerId: "e2" },
    ];
    queue.push(employees, [], [], [], []);
    const res = await GET();
    const tree = await res.json();

    expect(tree).toHaveLength(1);
    const root = tree[0];
    expect(root.id).toBe("e1");
    expect(root.children).toHaveLength(2);

    const bob = root.children.find((c: { id: string }) => c.id === "e2");
    expect(bob.children).toHaveLength(1);
    expect(bob.children[0].id).toBe("e4");
  });

  it("employee with unknown managerId becomes a root", async () => {
    const employees = [
      { id: "e1", firstName: "Alice", lastName: "", email: null, managerId: "ghost" },
    ];
    queue.push(employees, [], [], [], []);
    const res = await GET();
    const tree = await res.json();
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("e1");
  });

  it("attaches roles and positions to nodes", async () => {
    const employees = [
      { id: "e1", firstName: "Alice", lastName: "", email: null, managerId: null },
    ];
    queue.push(
      employees,
      [{ employeeId: "e1", roleId: "r1" }],
      [{ employeeId: "e1", positionId: "p1" }],
      [{ id: "r1", name: "Frontend developer" }],
      [{ id: "p1", name: "Team Lead" }],
    );
    const res = await GET();
    const tree = await res.json();
    expect(tree[0].roles).toEqual([{ id: "r1", name: "Frontend developer" }]);
    expect(tree[0].positions).toEqual([{ id: "p1", name: "Team Lead" }]);
  });
});

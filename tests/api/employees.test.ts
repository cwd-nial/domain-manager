import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_SESSION, mockGetSession } from "../helpers/createMockSession";

const { queue } = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../helpers/createMockDb");
  return { db: createMockDb(queue) };
});

vi.mock("@/lib/session", () => ({ getSession: mockGetSession }));

// Drizzle schema is imported by routes — mock it to avoid the libsql dependency
vi.mock("@/drizzle/schema", () => ({
  employees: "employees",
  employeeRoles: "employeeRoles",
  employeePositions: "employeePositions",
  employeeTeams: "employeeTeams",
  roles: "roles",
  positions: "positions",
  teams: "teams",
}));

const { GET, POST } = await import("@/app/api/employees/route");

beforeEach(() => {
  queue.length = 0;
  mockGetSession.mockResolvedValue(MOCK_SESSION);
});

// ── GET /api/employees ─────────────────────────────────────────────────────────

describe("GET /api/employees", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns empty array when no employees", async () => {
    // 7 parallel selects: employees, empRoles, empPositions, empTeams, roles, positions, teams
    queue.push([], [], [], [], [], [], []);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns enriched employee list with manager name resolved", async () => {
    const emp1 = {
      id: "e1",
      firstName: "Alice",
      lastName: "Smith",
      email: null,
      managerId: "e2",
    };
    const emp2 = {
      id: "e2",
      firstName: "Bob",
      lastName: "Jones",
      email: null,
      managerId: null,
    };
    queue.push(
      [emp1, emp2], // employees
      [{ employeeId: "e1", roleId: "r1" }], // employeeRoles
      [], // employeePositions
      [{ employeeId: "e1", teamId: "t1" }], // employeeTeams
      [{ id: "r1", name: "Frontend developer" }], // roles
      [], // positions
      [{ id: "t1", name: "Alpha Team" }], // teams
    );

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(2);

    const alice = data.find((e: { id: string }) => e.id === "e1");
    expect(alice.managerName).toBe("Bob Jones");
    expect(alice.roles).toEqual([{ id: "r1", name: "Frontend developer" }]);
    expect(alice.teams).toEqual([{ id: "t1", name: "Alpha Team" }]);
    expect(alice.positions).toEqual([]);

    const bob = data.find((e: { id: string }) => e.id === "e2");
    expect(bob.managerName).toBeNull();
  });
});

// ── POST /api/employees ────────────────────────────────────────────────────────

describe("POST /api/employees", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/employees", {
      method: "POST",
      body: JSON.stringify({ firstName: "Alice" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when firstName is missing", async () => {
    const req = new Request("http://localhost/api/employees", {
      method: "POST",
      body: JSON.stringify({ lastName: "Smith" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "First name is required" });
  });

  it("returns 400 when firstName is whitespace only", async () => {
    const req = new Request("http://localhost/api/employees", {
      method: "POST",
      body: JSON.stringify({ firstName: "   " }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 with generated id for minimal valid input", async () => {
    const req = new Request("http://localhost/api/employees", {
      method: "POST",
      body: JSON.stringify({ firstName: "Alice" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeTypeOf("string");
    expect(data.id.length).toBeGreaterThan(0);
  });

  it("returns 201 with all optional fields including roleIds and teamIds", async () => {
    const req = new Request("http://localhost/api/employees", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Carol",
        lastName: "White",
        email: "carol@example.com",
        roleIds: ["r1"],
        positionIds: ["p1"],
        teamIds: ["t1"],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

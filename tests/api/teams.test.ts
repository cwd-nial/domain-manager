import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_SESSION, mockGetSession } from "../helpers/createMockSession";

const { queue } = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../helpers/createMockDb");
  return { db: createMockDb(queue) };
});

vi.mock("@/lib/session", () => ({ getSession: mockGetSession }));

vi.mock("@/drizzle/schema", () => ({
  teams: "teams",
  employeeTeams: "employeeTeams",
}));

const { GET, POST } = await import("@/app/api/teams/route");

beforeEach(() => {
  queue.length = 0;
  mockGetSession.mockResolvedValue(MOCK_SESSION);
});

// ── GET /api/teams ─────────────────────────────────────────────────────────────

describe("GET /api/teams", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty array when no teams", async () => {
    queue.push([], []);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns teams with correct member counts", async () => {
    queue.push(
      [
        { id: "t1", name: "Alpha" },
        { id: "t2", name: "Beta" },
      ],
      [
        { teamId: "t1", employeeId: "e1" },
        { teamId: "t1", employeeId: "e2" },
        { teamId: "t2", employeeId: "e3" },
      ],
    );
    const res = await GET();
    const data = await res.json();
    expect(data).toHaveLength(2);
    const alpha = data.find((t: { id: string }) => t.id === "t1");
    expect(alpha.memberCount).toBe(2);
    const beta = data.find((t: { id: string }) => t.id === "t2");
    expect(beta.memberCount).toBe(1);
  });

  it("returns memberCount 0 for teams with no members", async () => {
    queue.push([{ id: "t1", name: "Empty" }], []);
    const res = await GET();
    const data = await res.json();
    expect(data[0].memberCount).toBe(0);
  });
});

// ── POST /api/teams ────────────────────────────────────────────────────────────

describe("POST /api/teams", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/teams", {
      method: "POST",
      body: JSON.stringify({ name: "Alpha" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/teams", {
      method: "POST",
      body: JSON.stringify({ description: "A team" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Name is required" });
  });

  it("returns 400 when name is whitespace only", async () => {
    const req = new Request("http://localhost/api/teams", {
      method: "POST",
      body: JSON.stringify({ name: "  " }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 with generated id", async () => {
    const req = new Request("http://localhost/api/teams", {
      method: "POST",
      body: JSON.stringify({ name: "Alpha" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeTypeOf("string");
  });

  it("returns 201 with optional parentId and description", async () => {
    const req = new Request("http://localhost/api/teams", {
      method: "POST",
      body: JSON.stringify({ name: "Sub-team", parentId: "t1", description: "A sub-team" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

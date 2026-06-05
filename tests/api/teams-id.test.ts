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
    employees: "employees",
}));

vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));

const { GET, PUT, DELETE } = await import("@/app/api/teams/[id]/route");

function makeParams(id: string) {
    return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
    queue.length = 0;
    mockGetSession.mockResolvedValue(MOCK_SESSION);
});

// ── GET /api/teams/[id] ────────────────────────────────────────────────────────

describe("GET /api/teams/:id", () => {
    it("returns 401 when unauthenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const res = await GET(new Request("http://localhost"), makeParams("t1"));
        expect(res.status).toBe(401);
    });

    it("returns 404 when team not found", async () => {
        queue.push([]); // select team → empty
        const res = await GET(new Request("http://localhost"), makeParams("missing"));
        expect(res.status).toBe(404);
    });

    it("returns team with members and sub-teams", async () => {
        const team = { id: "t1", name: "Alpha", description: null, parentId: null };
        queue.push(
            [team], // select team by id
            [{ employeeId: "e1", teamId: "t1" }], // empTeamRows
            [{ id: "t2", name: "Sub-Alpha" }], // subTeams
            [{ id: "e1", firstName: "Alice", lastName: "Smith", email: null }], // allEmps
        );
        const res = await GET(new Request("http://localhost"), makeParams("t1"));
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe("t1");
        expect(data.members).toHaveLength(1);
        expect(data.members[0].id).toBe("e1");
        expect(data.subTeams).toHaveLength(1);
    });
});

// ── PUT /api/teams/[id] ────────────────────────────────────────────────────────

describe("PUT /api/teams/:id", () => {
    it("returns 401 when unauthenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const req = new Request("http://localhost", {
            method: "PUT",
            body: JSON.stringify({ name: "Alpha" }),
        });
        const res = await PUT(req, makeParams("t1"));
        expect(res.status).toBe(401);
    });

    it("returns 400 when name is missing", async () => {
        const req = new Request("http://localhost", {
            method: "PUT",
            body: JSON.stringify({ description: "Some desc" }),
        });
        const res = await PUT(req, makeParams("t1"));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: "Name is required" });
    });

    it("returns 400 when parentId would create a cycle", async () => {
        // t2 would become parent of t1, but t2's parent is already t1
        queue.push([
            { id: "t1", parentId: null },
            { id: "t2", parentId: "t1" },
        ]);
        const req = new Request("http://localhost", {
            method: "PUT",
            body: JSON.stringify({ name: "Alpha", parentId: "t2" }),
        });
        const res = await PUT(req, makeParams("t1"));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: "Cycle detected in team hierarchy" });
    });

    it("returns 200 on successful update", async () => {
        const req = new Request("http://localhost", {
            method: "PUT",
            body: JSON.stringify({ name: "Alpha Updated" }),
        });
        const res = await PUT(req, makeParams("t1"));
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ success: true });
    });
});

// ── DELETE /api/teams/[id] ─────────────────────────────────────────────────────

describe("DELETE /api/teams/:id", () => {
    it("returns 401 when unauthenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const res = await DELETE(new Request("http://localhost"), makeParams("t1"));
        expect(res.status).toBe(401);
    });

    it("returns 400 when team has sub-teams", async () => {
        queue.push([{ id: "t2" }]); // sub-team exists
        const res = await DELETE(new Request("http://localhost"), makeParams("t1"));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: "Cannot delete: team has sub-teams" });
    });

    it("returns 200 on successful delete", async () => {
        queue.push([]); // no sub-teams
        const res = await DELETE(new Request("http://localhost"), makeParams("t1"));
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ success: true });
    });
});

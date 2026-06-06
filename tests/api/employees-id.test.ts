import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_SESSION, mockGetSession } from '../helpers/createMockSession';

const { queue } = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock('@/lib/db', async () => {
    const { createMockDb } = await import('../helpers/createMockDb');
    return { db: createMockDb(queue) };
});

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }));

vi.mock('@/drizzle/schema', () => ({
    employees: 'employees',
    employeeRoles: 'employeeRoles',
    employeePositions: 'employeePositions',
    employeeTeams: 'employeeTeams',
    roles: 'roles',
    positions: 'positions',
    teams: 'teams',
}));

vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

const { GET, PUT, DELETE } = await import('@/app/api/employees/[id]/route');

function makeParams(id: string) {
    return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
    queue.length = 0;
    mockGetSession.mockResolvedValue(MOCK_SESSION);
});

// ── GET /api/employees/[id] ────────────────────────────────────────────────────

describe('GET /api/employees/:id', () => {
    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const res = await GET(new Request('http://localhost'), makeParams('e1'));
        expect(res.status).toBe(401);
    });

    it('returns 404 when employee not found', async () => {
        queue.push([]); // select employee → empty
        const res = await GET(new Request('http://localhost'), makeParams('missing'));
        expect(res.status).toBe(404);
    });

    it('returns employee with roles, positions, teams, manager name, and reports', async () => {
        const emp = { id: 'e1', firstName: 'Alice', lastName: 'Smith', managerId: 'e2' };
        queue.push(
            [emp], // select employee by id
            [], // employeeRoles
            [], // employeePositions
            [], // employeeTeams
            [], // all roles
            [], // all positions
            [], // all teams
            [{ id: 'e2', firstName: 'Bob', lastName: 'Jones' }], // all employees (for manager name)
            [] // direct reports
        );
        const res = await GET(new Request('http://localhost'), makeParams('e1'));
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe('e1');
        expect(data.managerName).toBe('Bob Jones');
        expect(data.reports).toEqual([]);
    });
});

// ── PUT /api/employees/[id] ────────────────────────────────────────────────────

describe('PUT /api/employees/:id', () => {
    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ firstName: 'Alice' }),
        });
        const res = await PUT(req, makeParams('e1'));
        expect(res.status).toBe(401);
    });

    it('returns 400 when firstName is missing', async () => {
        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ lastName: 'Smith' }),
        });
        const res = await PUT(req, makeParams('e1'));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: 'First name is required' });
    });

    it('returns 400 when managerId would create a cycle', async () => {
        // e2 is being set as manager of e1, but e2's manager is e1 (cycle)
        queue.push([
            { id: 'e1', managerId: null },
            { id: 'e2', managerId: 'e1' }, // e2's manager is already e1
        ]);
        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ firstName: 'Alice', managerId: 'e2' }),
        });
        const res = await PUT(req, makeParams('e1'));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: 'Cycle detected in manager hierarchy' });
    });

    it('returns 200 on successful update', async () => {
        // No managerId so no cycle check; transaction for update
        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ firstName: 'Alice', roleIds: ['r1'], positionIds: [], teamIds: [] }),
        });
        const res = await PUT(req, makeParams('e1'));
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ success: true });
    });
});

// ── DELETE /api/employees/[id] ─────────────────────────────────────────────────

describe('DELETE /api/employees/:id', () => {
    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const res = await DELETE(new Request('http://localhost'), makeParams('e1'));
        expect(res.status).toBe(401);
    });

    it('returns 400 when employee has direct reports', async () => {
        queue.push([{ id: 'e2' }]); // select for reports → non-empty
        const res = await DELETE(new Request('http://localhost'), makeParams('e1'));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ error: 'Cannot delete: employee has direct reports' });
    });

    it('returns 200 on successful delete', async () => {
        queue.push([]); // select for reports → empty
        const res = await DELETE(new Request('http://localhost'), makeParams('e1'));
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ success: true });
    });
});

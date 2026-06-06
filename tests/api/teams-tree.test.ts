import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_SESSION, mockGetSession } from '../helpers/createMockSession';

const { queue } = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock('@/lib/db', async () => {
    const { createMockDb } = await import('../helpers/createMockDb');
    return { db: createMockDb(queue) };
});

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }));

vi.mock('@/drizzle/schema', () => ({
    teams: 'teams',
    employeeTeams: 'employeeTeams',
    employees: 'employees',
}));

const { GET } = await import('@/app/api/teams/tree/route');

beforeEach(() => {
    queue.length = 0;
    mockGetSession.mockResolvedValue(MOCK_SESSION);
});

describe('GET /api/teams/tree', () => {
    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const res = await GET();
        expect(res.status).toBe(401);
    });

    it('returns empty array when no teams', async () => {
        queue.push([], [], []);
        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
    });

    it('returns all null-parent teams as roots', async () => {
        queue.push(
            [
                { id: 't1', name: 'Alpha', description: null, parentId: null },
                { id: 't2', name: 'Beta', description: null, parentId: null },
            ],
            [],
            []
        );
        const res = await GET();
        const tree = await res.json();
        expect(tree).toHaveLength(2);
        expect(tree[0].children).toEqual([]);
    });

    it('nests child teams under their parent', async () => {
        queue.push(
            [
                { id: 't1', name: 'Root', description: null, parentId: null },
                { id: 't2', name: 'Child', description: null, parentId: 't1' },
                { id: 't3', name: 'Grandchild', description: null, parentId: 't2' },
            ],
            [],
            []
        );
        const res = await GET();
        const tree = await res.json();
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe('t1');
        expect(tree[0].children).toHaveLength(1);
        expect(tree[0].children[0].id).toBe('t2');
        expect(tree[0].children[0].children[0].id).toBe('t3');
    });

    it('team with unknown parentId becomes a root', async () => {
        queue.push([{ id: 't1', name: 'Orphan', description: null, parentId: 'ghost' }], [], []);
        const res = await GET();
        const tree = await res.json();
        expect(tree).toHaveLength(1);
    });

    it('includes member data on each node', async () => {
        queue.push(
            [{ id: 't1', name: 'Alpha', description: null, parentId: null }],
            [{ employeeId: 'e1', teamId: 't1' }],
            [{ id: 'e1', firstName: 'Alice', lastName: 'Smith' }]
        );
        const res = await GET();
        const tree = await res.json();
        expect(tree[0].memberCount).toBe(1);
        expect(tree[0].members[0].id).toBe('e1');
        expect(tree[0].members[0].firstName).toBe('Alice');
    });
});

import { describe, expect, it } from 'vitest';

import { TEAM_COLOR_CLASSES, buildTeamColorMap } from '@/lib/teamColors';

describe('buildTeamColorMap', () => {
    it('assigns distinct colors to teams within palette size', () => {
        const teams = Array.from({ length: 10 }, (_, i) => ({ id: `team-${i}` }));
        const map = buildTeamColorMap(teams);
        const colors = [...map.values()];
        expect(new Set(colors).size).toBe(10);
    });

    it('is deterministic — same input always yields the same map', () => {
        const teams = [{ id: 'aaa' }, { id: 'bbb' }, { id: 'ccc' }];
        const a = buildTeamColorMap(teams);
        const b = buildTeamColorMap(teams);
        for (const [id, cls] of a) {
            expect(b.get(id)).toBe(cls);
        }
    });

    it('wraps colors past palette length', () => {
        const teams = Array.from({ length: TEAM_COLOR_CLASSES.length + 1 }, (_, i) => ({ id: `t-${String(i).padStart(3, '0')}` }));
        const map = buildTeamColorMap(teams);
        const sorted = [...teams].sort((a, b) => a.id.localeCompare(b.id));
        expect(map.get(sorted[0].id)).toBe(map.get(sorted[TEAM_COLOR_CLASSES.length].id));
    });

    it('all assigned classes come from TEAM_COLOR_CLASSES', () => {
        const teams = [{ id: 'x' }, { id: 'y' }, { id: 'z' }];
        const map = buildTeamColorMap(teams);
        for (const cls of map.values()) {
            expect(TEAM_COLOR_CLASSES).toContain(cls);
        }
    });

    it('is stable regardless of input order', () => {
        const teams = [{ id: 'bbb' }, { id: 'aaa' }, { id: 'ccc' }];
        const reversed = [{ id: 'ccc' }, { id: 'bbb' }, { id: 'aaa' }];
        const a = buildTeamColorMap(teams);
        const b = buildTeamColorMap(reversed);
        expect(a.get('aaa')).toBe(b.get('aaa'));
        expect(a.get('bbb')).toBe(b.get('bbb'));
    });
});

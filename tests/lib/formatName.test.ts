import { describe, expect, it } from 'vitest';

import { formatName, sortKey } from '@/lib/formatName';

describe('formatName', () => {
    it('FL: first last', () => {
        expect(formatName('Alice', 'Smith', 'FL')).toBe('Alice Smith');
    });

    it('LF: last, first', () => {
        expect(formatName('Alice', 'Smith', 'LF')).toBe('Smith, Alice');
    });

    it('empty last name returns first name only', () => {
        expect(formatName('Alice', '', 'FL')).toBe('Alice');
        expect(formatName('Alice', '', 'LF')).toBe('Alice');
    });

    it('empty first name returns last name only', () => {
        expect(formatName('', 'Smith', 'FL')).toBe('Smith');
        expect(formatName('', 'Smith', 'LF')).toBe('Smith');
    });

    it('trims whitespace from both names', () => {
        expect(formatName('  Alice  ', '  Smith  ', 'FL')).toBe('Alice Smith');
    });

    it('whitespace-only first name treated as empty', () => {
        expect(formatName('  ', 'Smith', 'LF')).toBe('Smith');
    });
});

describe('sortKey', () => {
    it('FL: lowercase first last', () => {
        expect(sortKey('Alice', 'Smith', 'FL')).toBe('alice smith');
    });

    it('LF: lowercase last first', () => {
        expect(sortKey('Alice', 'Smith', 'LF')).toBe('smith alice');
    });

    it('trims and lowercases', () => {
        expect(sortKey('  BOB  ', '  JONES  ', 'FL')).toBe('bob jones');
    });
});

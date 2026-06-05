import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockDb(queue: unknown[]): any {
    const db: Record<string, unknown> = {};

    for (const method of [
        "select",
        "from",
        "where",
        "limit",
        "insert",
        "values",
        "update",
        "set",
        "delete",
    ]) {
        db[method] = vi.fn().mockReturnValue(db);
    }

    db.transaction = vi
        .fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation(async (cb: (tx: any) => Promise<unknown>) => cb(db));

    // Thenable: each await on the builder dequeues the next result.
    // Write operations (insert/update/delete) consume undefined (void).
    db.then = (
        resolve: (v: unknown) => unknown,
        reject: (e: unknown) => unknown,
    ) => {
        const result = queue.length > 0 ? queue.shift() : undefined;
        return Promise.resolve(result).then(resolve, reject);
    };

    return db;
}

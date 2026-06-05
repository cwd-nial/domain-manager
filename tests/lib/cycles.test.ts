import { describe, expect, it } from "vitest";

import { wouldCreateCycle } from "@/lib/cycles";

describe("wouldCreateCycle", () => {
    it("returns false when there is no cycle", () => {
        // A → B → C (no cycle if we assign D → C)
        expect(wouldCreateCycle("D", "C", { C: "B", B: "A", A: null })).toBe(false);
    });

    it("returns false when the new parent has no chain", () => {
        expect(wouldCreateCycle("e1", "e2", { e2: null })).toBe(false);
    });

    it("returns true for a direct self-reference", () => {
        expect(wouldCreateCycle("e1", "e1", {})).toBe(true);
    });

    it("returns true for an indirect cycle (A → B → C → A)", () => {
        expect(wouldCreateCycle("A", "B", { B: "C", C: "A", A: null })).toBe(true);
    });

    it("returns true when the entity appears deep in the proposed ancestor chain", () => {
        // Setting manager of e1 to e4, but e4 → e3 → e2 → e1
        expect(wouldCreateCycle("e1", "e4", { e4: "e3", e3: "e2", e2: "e1", e1: null })).toBe(
            true,
        );
    });

    it("handles an existing cycle in the map for unrelated nodes without infinite-looping", () => {
        // e4 → e5 → e4 loop exists, but entityId is e1 which is not in the loop
        expect(wouldCreateCycle("e1", "e4", { e4: "e5", e5: "e4" })).toBe(false);
    });

    it("returns false when newParentId is not in the map at all", () => {
        expect(wouldCreateCycle("e1", "unknown", {})).toBe(false);
    });
});

import { describe, expect, it } from "vitest";

import { TEAM_COLOR_CLASSES, teamColorClass } from "@/lib/teamColors";

const OVERRIDE_ID = "a93723ed-aded-4a28-8866-ed58e05439bb";

describe("teamColorClass", () => {
  it("returns orange override for the known collision ID", () => {
    expect(teamColorClass(OVERRIDE_ID)).toContain("orange");
  });

  it("returns a class from TEAM_COLOR_CLASSES for an unknown ID", () => {
    const cls = teamColorClass("some-random-team-id");
    expect(TEAM_COLOR_CLASSES).toContain(cls);
  });

  it("is deterministic — same ID always yields the same class", () => {
    const id = "stable-id-123";
    expect(teamColorClass(id)).toBe(teamColorClass(id));
  });

  it("different IDs can yield different classes", () => {
    const results = new Set(["id-a", "id-b", "id-c", "id-d", "id-e"].map(teamColorClass));
    expect(results.size).toBeGreaterThan(1);
  });

  it("override ID does not appear in the base palette", () => {
    const override = teamColorClass(OVERRIDE_ID);
    expect(TEAM_COLOR_CLASSES).not.toContain(override);
  });
});

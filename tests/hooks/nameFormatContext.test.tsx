// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { NameFormatProvider, useNameFormat } from "@/lib/nameFormatContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(NameFormatProvider, null, children);
}

beforeEach(() => {
  localStorage.clear();
});

describe("NameFormatProvider / useNameFormat", () => {
  it("defaults to LF format", () => {
    const { result } = renderHook(() => useNameFormat(), { wrapper });
    expect(result.current[0]).toBe("LF");
  });

  it("reads FL from localStorage on mount", async () => {
    localStorage.setItem("nameFormat", "FL");
    const { result } = renderHook(() => useNameFormat(), { wrapper });
    await act(async () => {});
    expect(result.current[0]).toBe("FL");
  });

  it("toggle switches LF → FL and persists to localStorage", () => {
    const { result } = renderHook(() => useNameFormat(), { wrapper });
    act(() => result.current[1]());
    expect(result.current[0]).toBe("FL");
    expect(localStorage.getItem("nameFormat")).toBe("FL");
  });

  it("toggle switches FL → LF", async () => {
    localStorage.setItem("nameFormat", "FL");
    const { result } = renderHook(() => useNameFormat(), { wrapper });
    await act(async () => {});
    act(() => result.current[1]());
    expect(result.current[0]).toBe("LF");
    expect(localStorage.getItem("nameFormat")).toBe("LF");
  });

  it("ignores non-FL values in localStorage (defaults to LF)", async () => {
    localStorage.setItem("nameFormat", "invalid");
    const { result } = renderHook(() => useNameFormat(), { wrapper });
    await act(async () => {});
    expect(result.current[0]).toBe("LF");
  });
});

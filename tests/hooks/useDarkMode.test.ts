// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useDarkMode } from "@/hooks/useDarkMode";

beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
});

describe("useDarkMode", () => {
    it("starts in light mode when localStorage has no value", () => {
        const { result } = renderHook(() => useDarkMode());
        expect(result.current[0]).toBe(false);
    });

    it("starts in dark mode when localStorage has theme=dark", async () => {
        localStorage.setItem("theme", "dark");
        const { result } = renderHook(() => useDarkMode());
        // useEffect fires after initial render
        await act(async () => {});
        expect(result.current[0]).toBe(true);
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("starts in light mode when localStorage has theme=light", async () => {
        localStorage.setItem("theme", "light");
        const { result } = renderHook(() => useDarkMode());
        await act(async () => {});
        expect(result.current[0]).toBe(false);
    });

    it("toggle switches from light to dark", async () => {
        const { result } = renderHook(() => useDarkMode());
        act(() => result.current[1]());
        expect(result.current[0]).toBe(true);
        expect(localStorage.getItem("theme")).toBe("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("toggle switches from dark back to light", async () => {
        localStorage.setItem("theme", "dark");
        const { result } = renderHook(() => useDarkMode());
        await act(async () => {});
        act(() => result.current[1]());
        expect(result.current[0]).toBe(false);
        expect(localStorage.getItem("theme")).toBe("light");
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
});

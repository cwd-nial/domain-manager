import { vi } from "vitest";

export const mockGetSession = vi.fn();

export const MOCK_SESSION = { user: { id: "user-1", name: "Test User", email: "test@example.com" } };

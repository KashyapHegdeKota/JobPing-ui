import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useRequestCooldown } from "./useRequestCooldown";
import { rememberCooldown } from "../lib/requestCooldown";

afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });
it("counts down, follows scope changes and cleans up timers", async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-12T00:00:00Z"));
  const { result, rerender, unmount } = renderHook(({ scope }) => useRequestCooldown(scope), { initialProps: { scope: "public" } });
  act(() => { rememberCooldown("public", Date.now() + 3000); });
  expect(result.current).toBe(3);
  await act(async () => { vi.advanceTimersByTime(1000); });
  expect(result.current).toBe(2);
  rerender({ scope: "private:bob:read" });
  expect(result.current).toBe(0);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

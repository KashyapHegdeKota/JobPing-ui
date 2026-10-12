import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useJobSocket } from "./useJobSocket";

class Socket {
  static instances: Socket[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  close = vi.fn();
  constructor() { Socket.instances.push(this); }
}
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, "random").mockReturnValue(0); Socket.instances = []; vi.stubGlobal("WebSocket", Socket); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it("updates callbacks without reopening the socket", () => {
  const first = vi.fn(), second = vi.fn(), refresh = vi.fn();
  const { rerender, unmount } = renderHook(({ callback }) => useJobSocket(callback, refresh), { initialProps: { callback: first } });
  rerender({ callback: second });
  act(() => { Socket.instances[0].onmessage?.({ data: "new event" }); });
  expect(second).toHaveBeenCalledWith("new event");
  expect(first).not.toHaveBeenCalled();
  expect(Socket.instances).toHaveLength(1);
  unmount();
  expect(Socket.instances[0].close).toHaveBeenCalledOnce();
});
it("resets backoff only after a stable connection and stops retries on unmount", async () => {
  const refresh = vi.fn();
  const { unmount } = renderHook(() => useJobSocket(vi.fn(), refresh));
  act(() => Socket.instances[0].onclose?.());
  await act(async () => { vi.advanceTimersByTime(1000); });
  act(() => Socket.instances[1].onopen?.());
  expect(refresh).toHaveBeenCalledOnce();
  await act(async () => { vi.advanceTimersByTime(30000); });
  act(() => Socket.instances[1].onclose?.());
  await act(async () => { vi.advanceTimersByTime(1000); });
  expect(Socket.instances).toHaveLength(3);
  act(() => Socket.instances[2].onclose?.());
  unmount();
  await act(async () => { vi.advanceTimersByTime(60000); });
  expect(Socket.instances).toHaveLength(3);
  expect(vi.getTimerCount()).toBe(0);
});

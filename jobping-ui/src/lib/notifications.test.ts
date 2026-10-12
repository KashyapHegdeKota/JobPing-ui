import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ user: { uid: "alice", getIdToken: vi.fn().mockResolvedValue("secret-token") } as { uid: string; getIdToken: ReturnType<typeof vi.fn> } | null }));
vi.mock("./firebase", () => ({ auth: { get currentUser() { return state.user; } } }));
beforeEach(() => { vi.resetModules(); sessionStorage.clear(); state.user = { uid: "alice", getIdToken: vi.fn().mockResolvedValue("secret-token") }; });
afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });
it("blocks private retries before requesting another identity token", async () => {
  const { notificationRequest } = await import("./notifications");
  const user = state.user!;
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429, headers: { "Retry-After": "30" } })));
  await expect(notificationRequest(user as never, "/me/notification-settings")).rejects.toThrow(/30 seconds/);
  await expect(notificationRequest(user as never, "/analytics/me")).rejects.toThrow(/30 seconds/);
  expect(user.getIdToken).toHaveBeenCalledOnce();
  expect(fetch).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("jobping.request-cooldowns.v1")).not.toContain("secret-token");
});
it("does not send an old account's token after an account change", async () => {
  const { notificationRequest } = await import("./notifications");
  const previous = state.user!;
  previous.getIdToken.mockImplementationOnce(async () => { state.user = null; return "secret-token"; });
  vi.stubGlobal("fetch", vi.fn());
  await expect(notificationRequest(previous as never, "/me/notification-settings")).rejects.toThrow(/account changed/);
  expect(fetch).not.toHaveBeenCalled();
});

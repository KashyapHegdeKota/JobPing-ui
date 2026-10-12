import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Request cooldowns", () => {
  beforeEach(() => { vi.resetModules(); sessionStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-12T12:00:00Z")); });
  afterEach(() => { sessionStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("parses delta seconds, HTTP dates and invalid values with bounds", async () => {
    const { retryDeadline } = await import("./requestCooldown");
    const now = Date.now();
    expect(retryDeadline("10", now)).toBe(now + 10_000);
    expect(retryDeadline(new Date(now + 5000).toUTCString(), now)).toBe(now + 5000);
    expect(retryDeadline("garbage", now)).toBe(now + 30_000);
    expect(retryDeadline("999999999999", now)).toBe(now + 86_400_000);
    expect(retryDeadline("0", now)).toBe(now + 1000);
  });
  it("preserves cooldowns across module reloads and isolates accounts/families", async () => {
    let protection = await import("./requestCooldown");
    protection.rememberCooldown("private:alice:write", Date.now() + 10_000);
    vi.resetModules();
    protection = await import("./requestCooldown");
    expect(() => protection.assertRequestReady("private:alice:write")).toThrow(/10 seconds/);
    expect(() => protection.assertRequestReady("private:bob:write")).not.toThrow();
    expect(() => protection.assertRequestReady("private:alice:read")).not.toThrow();
    vi.advanceTimersByTime(10_000);
    expect(() => protection.assertRequestReady("private:alice:write")).not.toThrow();
  });
  it("does not fetch again during a server cooldown and never retries automatically", async () => {
    const { limitedFetch } = await import("./requestCooldown");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429, headers: { "Retry-After": "8" } })));
    await expect(limitedFetch("https://api.test/jobs")).rejects.toThrow(/8 seconds/);
    await expect(limitedFetch("https://api.test/companies")).rejects.toThrow(/8 seconds/);
    expect(fetch).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(20_000);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("ignores corrupted storage and tolerates unavailable storage", async () => {
    sessionStorage.setItem("jobping.request-cooldowns.v1", "not-json");
    const { rememberCooldown, cooldownRemaining } = await import("./requestCooldown");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    rememberCooldown("public", Date.now() + 3000);
    expect(cooldownRemaining("public")).toBe(3);
  });
  it("keeps storage bounded and does not save URLs, tokens or response bodies", async () => {
    const { rememberCooldown } = await import("./requestCooldown");
    for (let i = 0; i < 100; i++) rememberCooldown(`family:${i}`, Date.now() + 10000);
    const entries = JSON.parse(sessionStorage.getItem("jobping.request-cooldowns.v1")!);
    expect(entries).toHaveLength(32);
    expect(entries[0][1]).toEqual({ until: Date.now() + 10000, status: 429 });
  });
});

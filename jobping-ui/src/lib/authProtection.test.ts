import { afterEach, expect, it, vi } from "vitest";
import { authenticationMessage } from "./authProtection";
import { cooldownRemaining } from "./requestCooldown";

afterEach(() => { sessionStorage.clear(); vi.useRealTimers(); });
it("handles provider throttling without exposing its response", () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-12T00:00:00Z"));
  expect(authenticationMessage({ code: "auth/too-many-requests", message: "secret" })).toContain("one minute");
  expect(cooldownRemaining("interactive-auth")).toBe(60);
});
it("does not reveal whether an account exists", () => {
  const missing = authenticationMessage({ code: "auth/user-not-found" });
  expect(missing).toBe(authenticationMessage({ code: "auth/wrong-password" }));
  expect(missing).toBe(authenticationMessage({ code: "auth/email-already-in-use" }));
  expect(authenticationMessage(new Error("private-account-response"))).not.toContain("private-account");
});

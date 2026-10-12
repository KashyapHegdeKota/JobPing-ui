import { expect, it } from "vitest";
import { reconnectDelay, stableConnectionMs } from "./reconnect";

it("bounds randomized delays without a synchronized reconnect storm", () => {
  expect(reconnectDelay(0, 0)).toBe(1000);
  expect(reconnectDelay(0, 1)).toBe(1500);
  expect(reconnectDelay(2, 0.5)).toBe(5000);
  expect(reconnectDelay(100, 1)).toBe(45000);
  expect(stableConnectionMs).toBe(30000);
});

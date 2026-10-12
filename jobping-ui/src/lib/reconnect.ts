const delays = [1000, 2000, 4000, 8000, 15000, 30000];
export const stableConnectionMs = 30_000;

// Jitter avoids reconnecting every visitor at the same instant after an outage.
export function reconnectDelay(attempt: number, random = Math.random()): number {
  const base = delays[Math.min(Math.max(0, Math.floor(attempt)), delays.length - 1)];
  return Math.round(base * (1 + Math.min(1, Math.max(0, random)) * 0.5));
}

// Browser cooldowns supplement server enforcement; they never authorize requests.
export class RequestCooldownError extends Error {
  constructor(public readonly retryAt: number, public readonly status = 429) {
    const seconds = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
    super(status === 429
      ? `Too many requests. Please wait ${seconds} seconds and try again.`
      : `Service temporarily unavailable. Please wait ${seconds} seconds and try again.`);
    this.name = "RequestCooldownError";
  }
}

export function retryDeadline(value: string | null, now = Date.now(), fallback = 30): number {
  const seconds = value?.trim() && /^\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : NaN;
  const date = value ? Date.parse(value) : NaN;
  const delay = Number.isFinite(seconds) ? seconds * 1000
    : Number.isFinite(date) ? date - now : fallback * 1000;
  return now + Math.min(86_400_000, Math.max(1000, delay));
}

type Cooldown = { until: number; status: number };
const storageKey = "jobping.request-cooldowns.v1";
const deadlines = new Map<string, Cooldown>();
const listeners = new Set<() => void>();

function readStored() {
  try {
    if (typeof window === "undefined") return;
    const entries: unknown = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(entries)) return;
    for (const entry of entries.slice(-32)) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      const [key, value] = entry;
      if (typeof key !== "string" || key.length > 256 || !value
        || !Number.isFinite(value.until) || value.until <= Date.now()
        || value.until > Date.now() + 86_400_000 || ![429, 503].includes(value.status)) continue;
      if ((deadlines.get(key)?.until ?? 0) < value.until) deadlines.set(key, value);
    }
  } catch { /* Storage may be disabled; server enforcement still applies. */ }
}

export function cooldownRemaining(scope: string): number {
  readStored();
  return Math.max(0, Math.ceil(((deadlines.get(scope)?.until ?? 0) - Date.now()) / 1000));
}

export function assertRequestReady(scope: string): void {
  if (cooldownRemaining(scope)) {
    const value = deadlines.get(scope)!;
    throw new RequestCooldownError(value.until, value.status);
  }
}

export function rememberCooldown(scope: string, until: number, status = 429): void {
  readStored();
  const bounded = Math.min(Date.now() + 86_400_000, Math.max(Date.now() + 1000, until));
  if ((deadlines.get(scope)?.until ?? 0) < bounded) deadlines.set(scope, { until: bounded, status });
  for (const [key, value] of deadlines) if (value.until <= Date.now()) deadlines.delete(key);
  while (deadlines.size > 32) deadlines.delete(deadlines.keys().next().value!);
  try { window.sessionStorage.setItem(storageKey, JSON.stringify([...deadlines])); } catch {}
  listeners.forEach((listener) => listener());
}

export function subscribeCooldown(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function limitedFetch(url: string, init: RequestInit = {}, scope = "public"): Promise<Response> {
  assertRequestReady(scope);
  const response = await fetch(url, init);
  if (response.status === 429 || response.status === 503) {
    const until = retryDeadline(response.headers?.get("Retry-After") ?? null, Date.now(), response.status === 503 ? 5 : 30);
    rememberCooldown(scope, until, response.status);
    throw new RequestCooldownError(until, response.status);
  }
  return response;
}

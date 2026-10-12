import { limitedFetch } from "./requestCooldown";

const cache = new Map<string, { until: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();

export async function publicReference<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.until > Date.now()) return cached.value as T;
  let request = pending.get(url);
  if (!request) {
    request = limitedFetch(url).then(async (response) => {
      if (!response.ok) throw new Error("Could not load reference data. Please try again.");
      const value: unknown = await response.json();
      cache.set(url, { until: Date.now() + 30_000, value });
      while (cache.size > 4) cache.delete(cache.keys().next().value!);
      return value;
    }).finally(() => pending.delete(url));
    pending.set(url, request);
  }
  return request as Promise<T>;
}

import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => { vi.resetModules(); sessionStorage.clear(); });
afterEach(() => { vi.unstubAllGlobals(); });
it("coalesces concurrent requests and caches successful reference data", async () => {
  const { publicReference } = await import("./publicReference");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('[{"name":"Example"}]')));
  const [a, b] = await Promise.all([publicReference("https://api.test/companies"), publicReference("https://api.test/companies")]);
  expect(a).toEqual(b);
  expect(fetch).toHaveBeenCalledOnce();
  expect(await publicReference("https://api.test/companies")).toEqual(a);
  expect(fetch).toHaveBeenCalledOnce();
});
it("does not cache failures as an empty successful response", async () => {
  const { publicReference } = await import("./publicReference");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("error", { status: 500 })).mockResolvedValueOnce(new Response("[]")));
  await expect(publicReference("https://api.test/companies")).rejects.toThrow(/reference data/);
  expect(await publicReference("https://api.test/companies")).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(2);
});

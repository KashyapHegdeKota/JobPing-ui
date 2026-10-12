import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useCompanies } from "./useCompanies";

const source = vi.hoisted(() => ({ reference: vi.fn() }));
vi.mock("../lib/publicReference", () => ({ publicReference: source.reference }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("uses the shared reference loader and sorts names", async () => {
  source.reference.mockResolvedValue([{ name: "Zeta" }, { name: "Alpha" }]);
  const { result } = renderHook(() => useCompanies());
  await waitFor(() => expect(result.current).toEqual(["Alpha", "Zeta"]));
  expect(source.reference).toHaveBeenCalledWith(expect.stringContaining("/api/v1/companies"));
});

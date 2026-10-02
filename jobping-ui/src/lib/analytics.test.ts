import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackActivity } from "./analytics";
const mock = vi.hoisted(() => ({ user: { uid: "alice", getIdToken: vi.fn().mockResolvedValue("token") }, signedIn: true }));
vi.mock("./firebase", () => ({ auth: { get currentUser() { return mock.signedIn ? mock.user : null; } } }));
describe("First-party activity recording", () => {
  beforeEach(() => { mock.signedIn = true; vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true })); });
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
  it("records bounded filter settings without a caller-supplied user identity", async () => {
    await trackActivity("filter_change", "/", { filters: { category: "New Grad", remote_only: true, date_filter: "All Time", company: null, search_used: true } });
    const options = vi.mocked(fetch).mock.calls[0][1]!;
    const body = JSON.parse(options.body as string);
    expect(body.filters).toEqual({ category: "New Grad", remote_only: true, date_filter: "All Time", company: null, search_used: true });
    expect(body.user_id).toBeUndefined();
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });
  it("does not record anonymous activity", async () => {
    mock.signedIn = false;
    await trackActivity("page_view", "/");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("never blocks a job-link click when recording fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(trackActivity("job_click", "/", { job_id: 1 })).resolves.toBeUndefined();
  });
});

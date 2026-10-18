import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BeforeApplying from "./BeforeApplying";
import ScreeningProfile from "./ScreeningProfile";
import ScreenedFeed from "./ScreenedFeed";
import { defaultRequirements, parseRestrictions, parseScreenedPage, parseScreening } from "../lib/screening";

const mocks = vi.hoisted(() => ({ request: vi.fn(), fetch: vi.fn(), auth: { currentUser: null as null | { uid: string; emailVerified: boolean } }, callback: null as null | ((user: unknown) => void) }));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => { mocks.callback = callback; callback(mocks.auth.currentUser); return vi.fn(); } }));
vi.mock("../lib/firebase", () => ({ auth: mocks.auth }));
vi.mock("../lib/notifications", () => ({ notificationRequest: mocks.request, notificationApiUrl: "https://api.example.com", privateRequestScope: () => "test" }));
vi.mock("../lib/requestCooldown", () => ({ limitedFetch: mocks.fetch }));
vi.mock("../hooks/useRequestCooldown", () => ({ useRequestCooldown: () => 0 }));
vi.mock("../lib/analytics", () => ({ trackActivity: vi.fn() }));
const job = { id: 1, title: "Engineer", company: "Acme", location: "Austin, TX, US", discovered_at: "2026-10-12T00:00:00Z", is_closed: false, apply_url: "https://employer.example/jobs/1" };
const page = { items: [], total: 0, counts: { matches: 0, review: 50, excluded: 1 }, page: 1, total_pages: 0, profile_configured: false };
beforeEach(() => { vi.clearAllMocks(); mocks.auth.currentUser = { uid: "alice", emailVerified: true }; });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("Private screening", () => {
  it("rejects malformed server screening labels and preserves official employer history", () => {
    expect(parseScreening({ bucket: "guaranteed", reasons: [] })).toBeUndefined();
    expect(() => parseScreenedPage({ ...page, counts: { matches: -1 } })).toThrow();
    expect(parseRestrictions({ restrictions: { citizenship_required: { value: "required", evidence: [{ source: "employer_page", excerpt: "Must be a citizen", observed_at: "2026-10-13T00:00:00Z", source_url: "javascript:alert(1)" }] } } })).toEqual({});
    const parsed = parseScreenedPage({
      ...page,
      items: [{
        id: 1, title: "Engineer", location: "Austin, TX, US", apply_url: job.apply_url,
        created_at: "2026-10-12T00:00:00Z", job_type: "internship", is_closed: false,
        company: { name: "Acme", immigration_records: [{ kind: "h1b_filings", year: 2025, count: 12, employer_name: "ACME LLC", source_url: "https://www.dol.gov/data", observed_at: "2026-10-12T00:00:00Z" }] },
        details: null, screening: { bucket: "matches", reasons: ["Matches your target"] },
      }],
    });
    expect(parsed.items[0].immigration_records?.[0]?.count).toBe(12);
  });
  it("shows the employer quote supporting a citizenship restriction and deterministic H-1B filing summary", async () => {
    const evidence = { job_id: 1, status: "complete", fresh: true, verified_at: "2026-10-13T00:00:00Z", checked_at: null, documents: [], details: { policies: {}, compensation: [], restrictions: { citizenship_required: { value: "required", evidence: [{ source: "employer_page", excerpt: "Candidates must be US citizens.", observed_at: "2026-10-13T00:00:00Z", source_url: job.apply_url }] } } }, screening: { bucket: "excluded", reasons: ["Employer requires citizenship or permanent authorization"] } };
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => evidence }); mocks.request.mockResolvedValue(evidence);
    render(
      <BeforeApplying
        job={{
          ...job,
          immigration_records: [
            { kind: "h1b_filings", year: 2016, count: 15, employer_name: "ACME INC.", source_url: "https://www.dol.gov/data", observed_at: "2026-10-12T00:00:00Z" },
            { kind: "h1b_filings", year: 2025, count: 35, employer_name: "ACME LLC", source_url: "https://www.dol.gov/data", observed_at: "2026-10-12T00:00:00Z" },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Check before applying" }));
    await screen.findByText("Citizenship restriction: required");
    expect(screen.getByText("Filed 50 H-1B petitions, last filed 2025")).toBeInTheDocument();
    expect(screen.getByText(/FY2025 · ACME LLC: 35 certified H-1B filings/)).toBeInTheDocument();
    expect(screen.getByText(/FY2016 · ACME INC\.: 15 certified H-1B filings/)).toBeInTheDocument();
    expect(screen.getByText("Candidates must be US citizens.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Employer source" })).toHaveAttribute("href", job.apply_url);
  });
  it("saves and deletes requirements without changing email settings", async () => {
    mocks.request.mockResolvedValue({ configured: false, requirements: defaultRequirements, revision: 0 });
    render(<ScreeningProfile />);
    await screen.findByLabelText("New-grad annual base-pay target (USD)");
    fireEvent.change(screen.getByLabelText("New-grad annual base-pay target (USD)"), { target: { value: "100000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save screening requirements" }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledWith(expect.anything(), "/me/screening-profile", expect.objectContaining({ method: "PUT", body: expect.stringContaining('"new_grad_annual":"100000"') })));
    await screen.findByText("Your private screening requirements are saved.");
    fireEvent.click(screen.getByRole("button", { name: "Delete screening requirements" }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledWith(expect.anything(), "/me/screening-profile", { method: "DELETE" }));
    expect(mocks.request.mock.calls.every(call => !String(call[1]).includes("notification-settings"))).toBe(true);
  });
  it("uses the server full-feed buckets and counts", async () => {
    mocks.request.mockResolvedValue(page);
    render(<ScreenedFeed />);
    await screen.findByRole("button", { name: "Needs review (50)" });
    fireEvent.click(screen.getByRole("button", { name: "Needs review (50)" }));
    await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith(expect.anything(), expect.stringContaining("bucket=review"), expect.anything()));
    expect(screen.getByText(/Set at least one requirement/)).toBeInTheDocument();
  });
  it("disables duplicate refreshes while pending and preserves results on failure", async () => {
    let reject!: (error: Error) => void;
    mocks.request.mockResolvedValueOnce(page).mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
    render(<ScreenedFeed />);
    await screen.findByRole("button", { name: "Needs review (50)" });
    fireEvent.click(screen.getByRole("button", { name: "Refresh results" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Refresh results" })).toBeDisabled());
    await act(async () => reject(new Error("Please wait before retrying")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please wait before retrying");
    expect(screen.getByRole("button", { name: "Needs review (50)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh results" })).not.toBeDisabled();
  });
  it("ignores stale bucket responses", async () => {
    let resolveOld!: (value: unknown) => void;
    mocks.request.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce({ ...page, counts: { ...page.counts, review: 7 } });
    render(<ScreenedFeed />);
    await waitFor(() => expect(mocks.request).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Needs review" }));
    await screen.findByRole("button", { name: "Needs review (7)" });
    await act(async () => resolveOld(page));
    expect(screen.queryByRole("button", { name: "Needs review (50)" })).not.toBeInTheDocument();
  });
  it("clears private results and pending state on sign-out", async () => {
    let resolveOld!: (value: unknown) => void;
    mocks.request.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    render(<ScreenedFeed />);
    await screen.findByText("Updating screened results…");
    act(() => { mocks.auth.currentUser = null; mocks.callback?.(null); });
    await act(async () => resolveOld(page));
    expect(screen.queryByText("Updating screened results…")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Needs review (50)" })).not.toBeInTheDocument();
  });
  it("shows inaccessible evidence and preserves manual continuation", async () => {
    const evidence = { job_id: 1, status: "failed", fresh: false, verified_at: null, checked_at: null, details: null, documents: [], screening: { bucket: "review", reasons: ["Couldn’t verify current pages"] } };
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => evidence }); mocks.request.mockResolvedValue(evidence);
    render(<BeforeApplying job={job} />);
    fireEvent.click(screen.getByRole("button", { name: "Check before applying" }));
    await screen.findByText("Couldn’t verify current pages");
    expect(screen.getByRole("link", { name: "Continue to employer manually" })).toHaveAttribute("href", job.apply_url);
    expect(mocks.request).toHaveBeenCalledWith(expect.anything(), "/me/jobs/1/evidence-check", expect.objectContaining({ method: "POST" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("does not request private refresh for anonymous users", async () => {
    mocks.auth.currentUser = null;
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: "not_checked", fresh: false, details: null, documents: [] }) });
    render(<BeforeApplying job={job} />);
    fireEvent.click(screen.getByRole("button", { name: "Check before applying" }));
    await screen.findByText(/Sign in with a verified account to refresh/);
    expect(mocks.request).not.toHaveBeenCalled();
  });
});

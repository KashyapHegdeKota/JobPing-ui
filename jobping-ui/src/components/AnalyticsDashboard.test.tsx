import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsDashboard from "./AnalyticsDashboard";

const mock = vi.hoisted(() => ({
  user: { uid: "alice", getIdToken: vi.fn().mockResolvedValue("token") },
  signedIn: true,
}));
vi.mock("../lib/firebase", () => ({ auth: { get currentUser() { return mock.signedIn ? mock.user : null; } } }));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: (_: unknown, callback: (user: unknown) => void) => {
  callback(mock.signedIn ? mock.user : null); return vi.fn();
} }));
const summary = () => ({
  activity: { days: 30, timezone: "UTC", page_views: 4, filter_changes: 2, job_clicks: 1,
    tracking_started_at: null, trend: [{ date: "2026-10-01", active_users: 1, page_views: 4 }],
    filters: { category: [{ value: "New Grad", count: 2 }] } },
  emails: { sent: 3, delivered: 1, pending: 0, failed: 0 }, matched_occurrences: 6,
  active_users: { "1": 2, "7": 5, "30": 8 }, tracked_users: 9,
  jobs_discovered: 20, jobs_open: 15, reposted_occurrences: 2, email_subscribers: 4,
  preferences: { alerts: true, recap: false, job_types: ["internship"], seasons: [2027], timezone: "America/Phoenix" },
});

describe("Analytics dashboard", () => {
  beforeEach(() => {
    mock.signedIn = true;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => summary() }));
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it("does not request analytics while signed out", async () => {
    mock.signedIn = false;
    render(<AnalyticsDashboard />);
    expect(await screen.findByText(/Sign in from the navigation/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("loads the self endpoint and renders only personal metrics", async () => {
    render(<AnalyticsDashboard />);
    expect(await screen.findByText("Your page views")).toBeInTheDocument();
    expect(screen.queryByText("Unique jobs discovered")).not.toBeInTheDocument();
    expect(screen.getByText("Your filter usage")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/analytics/me?days=30"), expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token" }) }));
    fireEvent.change(screen.getByLabelText("Analytics period"), { target: { value: "7" } });
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("days=7"), expect.anything()));
  });
  it("shows site aggregates through the protected site endpoint", async () => {
    render(<AnalyticsDashboard site />);
    expect(await screen.findByText("Unique jobs discovered")).toBeInTheDocument();
    expect(screen.queryByText("Your email preferences")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/analytics/site"), expect.anything());
  });
  it("shows authorization failures without falling back to public metrics", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: "Site analytics requires an admin account" }) }));
    render(<AnalyticsDashboard site />);
    expect(await screen.findByRole("alert")).toHaveTextContent("requires an admin account");
    expect(screen.queryByText("Unique jobs discovered")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

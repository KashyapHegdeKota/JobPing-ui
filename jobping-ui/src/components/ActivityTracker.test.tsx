import { cleanup, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ActivityTracker from "./ActivityTracker";

const mock = vi.hoisted(() => ({ page: "/", uid: "alice", track: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => mock.page }));
vi.mock("../lib/firebase", () => ({ auth: { get currentUser() { return mock.uid ? { uid: mock.uid } : null; } } }));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: (_: unknown, callback: () => void) => { callback(); return mock.unsubscribe; } }));
vi.mock("../lib/analytics", () => ({ trackActivity: mock.track }));

describe("Visible signed-in activity", () => {
  beforeEach(() => {
    mock.page = "/"; mock.uid = "alice";
    vi.useFakeTimers(); vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.clearAllMocks(); });
  it("counts one page view in Strict Mode and releases the heartbeat", () => {
    const view = render(<StrictMode><ActivityTracker /></StrictMode>);
    expect(mock.track).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(mock.track).toHaveBeenLastCalledWith("heartbeat", "/");
    view.unmount();
    const count = mock.track.mock.calls.length;
    vi.advanceTimersByTime(60_000);
    expect(mock.track).toHaveBeenCalledTimes(count);
  });
  it("does not count hidden tabs", () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(<ActivityTracker />);
    vi.advanceTimersByTime(120_000);
    expect(mock.track).not.toHaveBeenCalled();
  });
  it("normalizes recap URLs without storing delivery IDs", () => {
    mock.page = "/profile/recaps/private-delivery-id";
    render(<ActivityTracker />);
    expect(mock.track).toHaveBeenCalledWith("page_view", "/profile/recaps");
  });
  it("preserves the feed analytics contract at its new UI route", () => {
    mock.page = "/jobs";
    render(<ActivityTracker />);
    expect(mock.track).toHaveBeenCalledWith("page_view", "/");
  });
});

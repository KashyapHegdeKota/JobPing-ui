import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationProfile from "./NotificationProfile";

const mock = vi.hoisted(() => ({
  user: {
    uid: "alice",
    getIdToken: vi.fn().mockResolvedValue("verified-token"),
    reload: vi.fn().mockResolvedValue(undefined),
  },
  signedIn: true,
  verification: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/firebase", () => ({
  auth: {
    get currentUser() {
      return mock.signedIn ? mock.user : null;
    },
  },
}));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_: unknown, callback: (user: unknown) => void) => {
    callback(mock.signedIn ? mock.user : null);
    return vi.fn();
  },
  sendEmailVerification: mock.verification,
}));
vi.mock("./AuthModal", () => ({ default: () => null }));

const defaults = () => ({
  alerts: false,
  recap: false,
  job_types: ["internship", "new_grad"],
  seasons: [2026, 2027],
  timezone: "UTC",
  email: "alice@example.com",
  verified: true,
  provider: "shared",
  sender: null,
  status: "ready",
  next_recap: null,
  key_configured: false,
  webhook_configured: false,
  webhook_path: null,
  paused_until: null,
  last_delivery_status: null,
  last_error: null,
  sending_enabled: true,
});

describe("Notification profile", () => {
  beforeEach(() => {
    mock.signedIn = true;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => defaults() }),
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("offers sign-in without requesting private settings", async () => {
    mock.signedIn = false;
    render(<NotificationProfile />);
    expect(
      await screen.findByRole("button", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("saves only the selected preferences with a Firebase bearer token", async () => {
    render(<NotificationProfile />);
    fireEvent.click(await screen.findByLabelText("New job alerts"));
    fireEvent.click(screen.getByLabelText("Daily recap"));
    fireEvent.click(screen.getByLabelText("2026"));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await screen.findByText("Your notification preferences are saved.");
    const calls = vi.mocked(fetch).mock.calls;
    const save = calls.find(([, init]) => init?.method === "PUT");
    expect(save).toBeDefined();
    expect(JSON.parse(String(save![1]!.body))).toMatchObject({
      alerts: true,
      recap: true,
      seasons: [2027],
    });
    expect(save![1]!.headers).toMatchObject({
      Authorization: "Bearer verified-token",
    });
  });

  it("blocks email opt-in until verification", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ...defaults(), verified: false }),
    } as Response);
    render(<NotificationProfile />);
    expect(await screen.findByLabelText("New job alerts")).toBeDisabled();
    expect(screen.getByLabelText("Daily recap")).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification email" }),
    );
    await waitFor(() =>
      expect(mock.verification).toHaveBeenCalledWith(mock.user),
    );
  });

  it("submits BYOK credentials once and clears the secret inputs", async () => {
    render(<NotificationProfile />);
    await screen.findByLabelText("New job alerts");
    fireEvent.click(
      screen.getByText("Use your own Resend account", { exact: false }),
    );
    fireEvent.change(screen.getByLabelText("Verified sender address"), {
      target: { value: "alerts@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Resend API key"), {
      target: { value: "re_secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save connection" }));
    await screen.findByText(
      "Connection saved. Send a test email to finish setup.",
    );
    expect(screen.getByLabelText("Resend API key")).toHaveValue("");
    const call = vi
      .mocked(fetch)
      .mock.calls.find(([url]) => String(url).endsWith("/me/email-provider"));
    expect(JSON.parse(String(call![1]!.body))).toEqual({
      sender: "alerts@example.com",
      api_key: "re_secret",
      webhook_secret: null,
    });
    expect(screen.queryByText("re_secret")).not.toBeInTheDocument();
  });

  it("shows shared-capacity errors without reporting a successful save", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => defaults(),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "The ten shared email places are full." }),
      } as Response);
    render(<NotificationProfile />);
    fireEvent.click(await screen.findByLabelText("Daily recap"));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The ten shared email places are full.",
    );
    expect(
      screen.queryByText("Your notification preferences are saved."),
    ).not.toBeInTheDocument();
  });
});

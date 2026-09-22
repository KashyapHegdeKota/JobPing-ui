import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Recap } from "../lib/notifications";
import NotificationRecap from "./NotificationRecap";

const mock = vi.hoisted(() => ({
  user: { uid: "alice" },
  signedIn: true,
  request: vi.fn(),
}));

vi.mock("../lib/firebase", () => ({
  auth: {
    get currentUser() {
      return mock.signedIn ? mock.user : null;
    },
  },
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (
    _auth: unknown,
    callback: (user: typeof mock.user | null) => void,
  ) => {
    callback(mock.signedIn ? mock.user : null);
    return vi.fn();
  },
}));

vi.mock("../lib/notifications", () => ({
  notificationRequest: mock.request,
}));
vi.mock("next/link", () => ({ default: "a" }));
vi.mock("./AuthModal", () => ({ default: () => null }));

type RecapCounts = Pick<Recap, "total_matches" | "new_count" | "reposted_count">;

const makeJob = (
  overrides: Partial<Recap["jobs"][number]> = {},
): Recap["jobs"][number] => ({
  id: 1,
  occurrence_id: 101,
  kind: "discovered",
  title: "Software Engineer",
  company: "Acme",
  location: "Remote",
  job_type: "internship",
  season: 2027,
  closed: false,
  apply_url: "https://jobs.example/apply",
  date_text: "Posted Sep 22, 2026",
  ...overrides,
});

function makeRecap(
  jobs: Recap["jobs"],
  countOverrides: Partial<RecapCounts> = {},
): Recap {
  return {
    id: "recap-1",
    window_start: "2026-09-21T00:00:00Z",
    window_end: "2026-09-22T00:00:00Z",
    total_matches: jobs.length,
    new_count: jobs.filter((job) => job.kind !== "reposted").length,
    reposted_count: jobs.filter((job) => job.kind === "reposted").length,
    jobs,
    ...countOverrides,
  };
}

function renderRecap(data: Recap) {
  mock.request.mockResolvedValue(data);
  render(<NotificationRecap id={data.id} />);
}

describe("NotificationRecap", () => {
  beforeEach(() => {
    mock.signedIn = true;
    mock.request.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("groups mixed recap entries and labels every repost", async () => {
    const jobs = [
      makeJob({ id: 1, occurrence_id: 101, title: "New role one" }),
      makeJob({ id: 2, occurrence_id: 102, title: "New role two" }),
      makeJob({
        id: 3,
        occurrence_id: 103,
        kind: "reposted",
        title: "Reposted role one",
      }),
      makeJob({
        id: 4,
        occurrence_id: 104,
        kind: "reposted",
        title: "Reposted role two",
      }),
    ];
    renderRecap(makeRecap(jobs));

    expect(
      await screen.findByRole("heading", { name: "NEW JOBS · 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "REPOSTED JOBS · 2" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getAllByText("REPOSTED", { exact: true })).toHaveLength(2);
  });

  it("renders distinct occurrences of the same logical job as separate cards", async () => {
    const duplicateKeyWarning = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    renderRecap(
      makeRecap([
        makeJob({
          id: 42,
          occurrence_id: 100,
          kind: "discovered",
          title: "Software Engineer",
          date_text: "Discovered Sep 1, 2026",
        }),
        makeJob({
          id: 42,
          occurrence_id: 184,
          kind: "reposted",
          title: "Software Engineer",
          date_text: "Reposted Sep 22, 2026",
        }),
      ]),
    );

    expect(
      await screen.findAllByRole("heading", {
        name: "Software Engineer",
      }),
    ).toHaveLength(2);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText(/Discovered Sep 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Reposted Sep 22, 2026/)).toBeInTheDocument();
    expect(
      duplicateKeyWarning.mock.calls.flat().join(" "),
    ).not.toContain("same key");
  });

  it("shows only the repost section for a repost-only recap", async () => {
    renderRecap(
      makeRecap([
        makeJob({ kind: "reposted", occurrence_id: 501 }),
      ]),
    );

    expect(
      await screen.findByRole("heading", { name: "REPOSTED JOBS · 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /NEW JOBS/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("REPOSTED", { exact: true })).toBeInTheDocument();
  });

  it("shows only the new jobs section for a new-only recap", async () => {
    renderRecap(makeRecap([makeJob()]));

    expect(
      await screen.findByRole("heading", { name: "NEW JOBS · 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /REPOSTED JOBS/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("REPOSTED", { exact: true }),
    ).not.toBeInTheDocument();
  });

  it("displays recap and section counts from the backend response", async () => {
    renderRecap(
      makeRecap(
        [
          makeJob({ occurrence_id: 201 }),
          makeJob({ occurrence_id: 202, kind: "reposted" }),
        ],
        { total_matches: 18, new_count: 14, reposted_count: 4 },
      ),
    );

    expect(
      await screen.findByText(/18 matches · 14 new · 4 reposted/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "NEW JOBS · 14" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "REPOSTED JOBS · 4" }),
    ).toBeInTheDocument();
  });

  it("shows a closed state and no Apply action for a closed repost occurrence", async () => {
    renderRecap(
      makeRecap([
        makeJob({ kind: "reposted", closed: true, occurrence_id: 301 }),
      ]),
    );

    const card = (await screen.findByRole("article")) as HTMLElement;
    expect(card).toHaveTextContent("Applications closed");
    expect(
      screen.queryByRole("link", { name: "Apply now" }),
    ).not.toBeInTheDocument();
  });

  it("offers Apply for an open repost with a safe HTTP URL", async () => {
    renderRecap(
      makeRecap([
        makeJob({
          kind: "reposted",
          closed: false,
          occurrence_id: 401,
          apply_url: "https://jobs.example/open-role",
        }),
      ]),
    );

    expect(
      await screen.findByRole("link", { name: "Apply now" }),
    ).toHaveAttribute("href", "https://jobs.example/open-role");
  });

  it.each(["javascript:alert(1)", "mailto:apply@example.com", "//jobs.example/role"])(
    "does not make unsafe apply URL %s clickable",
    async (applyUrl) => {
      renderRecap(
        makeRecap([
          makeJob({
            kind: "reposted",
            occurrence_id: 402,
            apply_url: applyUrl,
          }),
        ]),
      );

      expect(await screen.findByRole("article")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Apply now" }),
      ).not.toBeInTheDocument();
    },
  );

  it("prompts signed-out visitors to sign in without requesting a recap", async () => {
    mock.signedIn = false;
    render(<NotificationRecap id="recap-1" />);

    expect(
      await screen.findByText("Sign in to view your personal recap."),
    ).toBeInTheDocument();
    expect(mock.request).not.toHaveBeenCalled();
  });

  it("shows backend and authentication request failures accessibly", async () => {
    mock.request.mockRejectedValue(new Error("Please sign in again."));
    render(<NotificationRecap id="recap-1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please sign in again.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

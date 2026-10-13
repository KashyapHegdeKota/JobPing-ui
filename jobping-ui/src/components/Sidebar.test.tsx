import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Sidebar from "./Sidebar";

const account = vi.hoisted(() => ({ callback: null as ((user: { uid: string; email: string } | null) => void) | null, unsubscribe: vi.fn(), signOut: vi.fn() }));
vi.mock("../lib/firebase", () => ({ auth: {} }));
vi.mock("next/navigation", () => ({ usePathname: () => "/jobs" }));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: (_auth: unknown, callback: typeof account.callback) => { account.callback = callback; return account.unsubscribe; }, signOut: account.signOut }));
vi.mock("./ThemeToggle", () => ({ default: () => null }));
vi.mock("./AnalyticsNav", () => ({ default: () => null }));
vi.mock("./AuthModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div role="dialog">Sign in</div> : null }));

beforeEach(() => {
  account.callback = null;
  account.signOut.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("waits for the remembered user before displaying sign-in and cleans up its observer", () => {
  const view = render(<Sidebar />);
  expect(screen.queryByRole("button", { name: "Sign in to JobPing" })).not.toBeInTheDocument();
  for (const button of screen.getAllByRole("button", { name: "Checking account…" })) expect(button).toBeDisabled();
  act(() => account.callback!({ uid: "returning", email: "returning@example.com" }));
  expect(screen.getByText("returning")).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Sign out" })).toHaveLength(2);
  view.unmount();
  expect(account.unsubscribe).toHaveBeenCalledOnce();
});

it("signs out a remembered account explicitly and restores guest actions", async () => {
  render(<Sidebar />);
  act(() => account.callback!({ uid: "returning", email: "returning@example.com" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[1]);
  await waitFor(() => expect(account.signOut).toHaveBeenCalledWith({}));
  act(() => account.callback!(null));
  expect(screen.getByRole("button", { name: "Sign in to JobPing" })).toBeInTheDocument();
});

it("closes a guest dialog when the account signs in from another tab", () => {
  render(<Sidebar />);
  act(() => account.callback!(null));
  fireEvent.click(screen.getByRole("button", { name: "Sign in to JobPing" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  act(() => account.callback!({ uid: "returning", email: "returning@example.com" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

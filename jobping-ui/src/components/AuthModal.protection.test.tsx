import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AuthModal from "./AuthModal";

const provider = vi.hoisted(() => ({ email: vi.fn(), google: vi.fn() }));
vi.mock("../lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({ signInWithEmailAndPassword: provider.email, createUserWithEmailAndPassword: provider.email, signInWithPopup: provider.google, GoogleAuthProvider: class {}, setPersistence: vi.fn().mockResolvedValue(undefined), browserLocalPersistence: {} }));
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); vi.useRealTimers(); });
it("guards double submissions before state has rerendered", async () => {
  provider.email.mockImplementationOnce(() => new Promise(() => {}));
  render(<AuthModal isOpen initialMode="signin" onClose={vi.fn()} />);
  const form = screen.getByLabelText("Email").closest("form")!;
  fireEvent.submit(form); fireEvent.submit(form);
  await waitFor(() => expect(provider.email).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(provider.google).not.toHaveBeenCalled();
});
it("uses a provider throttle cooldown and never automatically retries credentials", async () => {
  provider.google.mockRejectedValueOnce({ code: "auth/too-many-requests", message: "sensitive account" });
  render(<AuthModal isOpen onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("one minute");
  expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  expect(screen.queryByText(/sensitive account/)).not.toBeInTheDocument();
  expect(provider.google).toHaveBeenCalledOnce();
});

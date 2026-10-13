import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthModal from "./AuthModal";

vi.mock("../lib/firebase", () => ({ auth: {} }));
const login = vi.hoisted(() => ({ signup: vi.fn().mockResolvedValue({}), signin: vi.fn().mockResolvedValue({}), google: vi.fn().mockResolvedValue({}), persistence: vi.fn(), local: { type: "LOCAL" } }));
vi.mock("firebase/auth", () => ({ createUserWithEmailAndPassword: login.signup, signInWithEmailAndPassword: login.signin, signInWithPopup: login.google, GoogleAuthProvider: class {}, setPersistence: login.persistence, browserLocalPersistence: login.local }));
beforeEach(() => login.persistence.mockReset().mockResolvedValue(undefined));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Authentication dialog", () => {
  it("labels inputs and returns focus after closing", () => {
    const trigger = document.createElement("button"); document.body.append(trigger); trigger.focus();
    const close = vi.fn();
    const view = render(<AuthModal isOpen onClose={close} />);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Make your next move.");
    expect(screen.getByLabelText("Email")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" }); expect(close).toHaveBeenCalledOnce();
    view.unmount(); expect(trigger).toHaveFocus(); expect(document.body.style.overflow).toBe(""); trigger.remove();
  });
  it("wraps keyboard focus inside the dialog", () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);
    screen.getByRole("button", { name: "Create account" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Close sign-in dialog" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Create account" })).toHaveFocus();
  });
  it("preserves Firebase email sign-in and Google actions", async () => {
    const close = vi.fn(); const completed = vi.fn(); render(<AuthModal isOpen onClose={close} onAuthenticated={completed} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    await waitFor(() => expect(login.signin).toHaveBeenCalledWith({}, "test@example.com", "test-password"));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    await waitFor(() => expect(login.google).toHaveBeenCalledOnce());
    await waitFor(() => expect(completed).toHaveBeenCalledTimes(2));
  });
  it("does not hand off after a failed Google popup", async () => {
    login.google.mockRejectedValueOnce(new Error("Popup cancelled"));
    const close = vi.fn(); const completed = vi.fn();
    render(<AuthModal isOpen onClose={close} onAuthenticated={completed} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not complete sign-in");
    expect(close).not.toHaveBeenCalled();
    expect(completed).not.toHaveBeenCalled();
  });
  it("hands off after creating an email account from the landing page", async () => {
    const completed = vi.fn();
    render(<AuthModal isOpen initialMode="signup" onClose={vi.fn()} onAuthenticated={completed} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    await waitFor(() => expect(login.signup).toHaveBeenCalledWith({}, "new@example.com", "test-password"));
    await waitFor(() => expect(completed).toHaveBeenCalledOnce());
  });
  it.each(["signin", "signup", "google"] as const)("remembers the session before completing %s", async (method) => {
    let finishPersistence!: () => void;
    login.persistence.mockImplementationOnce(() => new Promise<void>((resolve) => { finishPersistence = resolve; }));
    const completed = vi.fn();
    render(<AuthModal isOpen initialMode={method === "signup" ? "signup" : "signin"} onClose={vi.fn()} onAuthenticated={completed} />);
    if (method === "google") fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    else {
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "returning@example.com" } });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
      fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    }
    expect(login.persistence).toHaveBeenCalledWith({}, login.local);
    expect(login.signin).not.toHaveBeenCalled();
    expect(login.signup).not.toHaveBeenCalled();
    expect(login.google).not.toHaveBeenCalled();
    expect(completed).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    finishPersistence();
    await waitFor(() => expect(completed).toHaveBeenCalledOnce());
    expect(login[method]).toHaveBeenCalledOnce();
  });
  it("keeps the dialog open when session storage fails and allows a manual retry", async () => {
    login.persistence.mockRejectedValueOnce(new Error("Storage blocked: sensitive provider detail"));
    const close = vi.fn(); const completed = vi.fn();
    render(<AuthModal isOpen onClose={close} onAuthenticated={completed} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not complete sign-in");
    expect(screen.queryByText(/sensitive provider detail/)).not.toBeInTheDocument();
    expect(login.google).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(completed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    await waitFor(() => expect(completed).toHaveBeenCalledOnce());
    expect(login.google).toHaveBeenCalledOnce();
  });
});



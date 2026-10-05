import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthModal from "./AuthModal";

vi.mock("../lib/firebase", () => ({ auth: {} }));
const login = vi.hoisted(() => ({ signup: vi.fn().mockResolvedValue({}), signin: vi.fn().mockResolvedValue({}), google: vi.fn().mockResolvedValue({}) }));
vi.mock("firebase/auth", () => ({ createUserWithEmailAndPassword: login.signup, signInWithEmailAndPassword: login.signin, signInWithPopup: login.google, GoogleAuthProvider: class {} }));
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
    const close = vi.fn(); render(<AuthModal isOpen onClose={close} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    await waitFor(() => expect(login.signin).toHaveBeenCalledWith({}, "test@example.com", "test-password"));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    await waitFor(() => expect(login.google).toHaveBeenCalledOnce());
  });
});



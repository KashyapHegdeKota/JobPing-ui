import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LandingPage from "./LandingPage";

vi.mock("./AuthModal", () => ({ default: ({ isOpen, initialMode, onClose }: { isOpen: boolean; initialMode: string; onClose: () => void }) => isOpen ? <div role="dialog" aria-label={initialMode}><button onClick={onClose}>Close account dialog</button></div> : null }));
afterEach(cleanup);

describe("Landing page", () => {
  it("connects the reference calls to action to the real feed and preferences", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: "Explore the live feed" })).toHaveAttribute("href", "/jobs");
    expect(screen.getAllByRole("link", { name: "Daily recap" })[0]).toHaveAttribute("href", "/profile");
    expect(screen.getByText(/Illustrative alert/)).toBeInTheDocument();
    expect(screen.getByText(/Your 8 PM recap/)).toBeInTheDocument();
  });
  it("opens the appropriate existing account mode", () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleName("signin");
    fireEvent.click(screen.getByRole("button", { name: "Close account dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Find my next opportunity" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleName("signup");
  });
  it("closes compact navigation after choosing a destination", () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getAllByRole("link", { name: "Live opportunities" })[1]);
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });
});

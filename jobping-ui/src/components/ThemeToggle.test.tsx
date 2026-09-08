import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "dark";
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it("persists and applies the selected theme", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem("jobping-theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("reflects the light preference applied by the bootstrap script", () => {
    window.localStorage.setItem("jobping-theme", "light");
    document.documentElement.dataset.theme = "light";
    render(<ThemeToggle />);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("keeps responsive toggle instances in sync", () => {
    render(<><ThemeToggle /><ThemeToggle /></>);
    fireEvent.click(screen.getAllByRole("button", { name: "Switch to light mode" })[0]);

    expect(screen.getAllByRole("button", { name: "Switch to dark mode" })).toHaveLength(2);
  });
});

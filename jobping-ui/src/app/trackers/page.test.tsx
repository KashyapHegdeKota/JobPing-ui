import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TrackersPage from "./page";

afterEach(cleanup);

describe("TrackersPage", () => {
  it("explains that tracker cards are a preview", () => {
    render(<TrackersPage />);
    expect(screen.getByRole("heading", { name: /a little focus/i })).toBeInTheDocument();
    expect(screen.getByText(/preview · 3 examples/i)).toBeInTheDocument();
    expect(screen.getByText(/sample content/i)).toBeInTheDocument();
    expect(screen.getAllByText("Sample")).toHaveLength(3);
  });

  it("keeps placeholder actions visibly inactive", () => {
    render(<TrackersPage />);
    expect(screen.getAllByRole("button", { name: /new tracker/i })[0]).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("button", { name: /view/i })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /view/i })[0]).toHaveAttribute("aria-disabled", "true");
  });
});

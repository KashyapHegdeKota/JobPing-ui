import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReferralsPage from "./page";

describe("ReferralsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it("renders the share link and explains that it is a sample", () => {
    render(<ReferralsPage />);
    expect(screen.getByRole("heading", { name: "Referral program" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://jobping.com?ref=jp_usr_9a8b7c6d")).toBeInTheDocument();
    expect(screen.getByText(/Sample link for this interface/)).toBeInTheDocument();
  });

  it("copies the link and returns to the default state", async () => {
    render(<ReferralsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    });
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://jobping.com?ref=jp_usr_9a8b7c6d");
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });

  it("keeps the apply code controls visibly unconnected", () => {
    render(<ReferralsPage />);
    expect(screen.getByRole("textbox", { name: "Referral code" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByText("Applying referral codes is not connected yet.")).toBeInTheDocument();
  });
});

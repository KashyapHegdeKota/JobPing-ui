import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspaceShell from "./WorkspaceShell";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname }));
vi.mock("./Sidebar", () => ({ default: () => <nav aria-label="Workspace navigation" /> }));
vi.mock("./WorkspaceHeader", () => ({ default: () => <header>Workspace header</header> }));
vi.mock("./ActivityTracker", () => ({ default: () => <span>Workspace activity tracker</span> }));
afterEach(cleanup);

describe("Public and workspace layouts", () => {
  it("leaves the public homepage free of workspace navigation and instrumentation", () => {
    location.pathname = "/";
    render(<WorkspaceShell><main>Public landing</main></WorkspaceShell>);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Workspace activity tracker")).not.toBeInTheDocument();
  });
  it.each(["/jobs", "/profile", "/profile/recaps/123", "/admin/analytics"])("retains the workspace shell at %s", (pathname) => {
    location.pathname = pathname;
    render(<WorkspaceShell><section>Workspace content</section></WorkspaceShell>);
    expect(screen.getByRole("navigation", { name: "Workspace navigation" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Workspace content");
    expect(screen.getByText("Workspace activity tracker")).toBeInTheDocument();
  });
});

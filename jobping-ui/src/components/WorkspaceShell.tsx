"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ActivityTracker from "./ActivityTracker";
import WorkspaceHeader from "./WorkspaceHeader";

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return children;
  return <div className="min-h-screen w-full flex flex-col md:flex-row">
    <Sidebar />
    <ActivityTracker />
    <main className="jp-main min-w-0 flex-1"><WorkspaceHeader />{children}</main>
  </div>;
}

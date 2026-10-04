"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./WorkspaceHeader.module.css";

export default function WorkspaceHeader() {
  const path = usePathname();
  const page = path.startsWith("/profile/recaps") ? "Daily recap" : path.startsWith("/admin") ? "Site analytics" : path.startsWith("/profile") ? "Profile & alerts" : path.startsWith("/activity") ? "Your activity" : path.startsWith("/referrals") ? "Referrals" : path.startsWith("/trackers") ? "Trackers" : "Live feed";
  return <header className={styles.header}>
    <div className={styles.breadcrumb}><span>Workspace</span><span aria-hidden="true">/</span><strong>{page}</strong></div>
    <Link href="/profile" className={styles.action}>Your preferences <ArrowUpRight size={14} aria-hidden="true" /></Link>
  </header>;
}

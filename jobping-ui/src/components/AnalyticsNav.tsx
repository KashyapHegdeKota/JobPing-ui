"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, ShieldCheck } from "lucide-react";
import styles from "./AnalyticsNav.module.css";
import type { User } from "firebase/auth";
import { notificationRequest } from "../lib/notifications";

export default function AnalyticsNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [adminUid, setAdminUid] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    if (user) {
      notificationRequest<{ admin: boolean }>(user, "/analytics/access")
        .then((result) => { if (current) setAdminUid(result.admin ? user.uid : null); })
        .catch(() => { if (current) setAdminUid(null); });
    }
    return () => { current = false; };
  }, [user]);
  if (!user) return null;
  return <nav aria-label="Analytics navigation" className={styles.nav}>
    <Link href="/activity" aria-current={pathname === "/activity" ? "page" : undefined} className={styles.link}><ChartNoAxesCombined size={17} aria-hidden="true" />Your activity</Link>
    {adminUid === user.uid && <Link href="/admin/analytics" aria-current={pathname === "/admin/analytics" ? "page" : undefined} className={styles.link}><ShieldCheck size={17} aria-hidden="true" />Site analytics</Link>}
  </nav>;
}


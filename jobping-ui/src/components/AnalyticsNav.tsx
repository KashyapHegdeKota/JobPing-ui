"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { notificationRequest } from "../lib/notifications";

export default function AnalyticsNav({ user }: { user: User | null }) {
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
  return <div className="flex flex-col gap-2 px-3 py-2 text-sm text-zinc-400">
    <Link href="/activity" className="hover:text-cyan-400">Your activity</Link>
    {adminUid === user.uid && <Link href="/admin/analytics" className="hover:text-cyan-400">Site analytics</Link>}
  </div>;
}

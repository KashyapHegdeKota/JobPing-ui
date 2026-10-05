"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { trackActivity } from "../lib/analytics";

export default function ActivityTracker() {
  const pathname = usePathname();
  const lastView = useRef<string | null>(null);
  useEffect(() => {
    // The feed keeps its established analytics identity after its UI route moves.
    const page = pathname === "/jobs" ? "/" : pathname.startsWith("/profile/recaps/") ? "/profile/recaps" : pathname;
    if (!["/", "/profile", "/profile/recaps", "/trackers", "/referrals", "/activity"].includes(page)) return;
    const record = () => {
      const uid = auth.currentUser?.uid;
      if (!uid) lastView.current = null;
      const signature = `${uid}:${page}`;
      if (uid && document.visibilityState === "visible" && lastView.current !== signature) {
        lastView.current = signature;
        void trackActivity("page_view", page);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, record);
    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        record();
        void trackActivity("heartbeat", page);
      }
    }, 60_000);
    document.addEventListener("visibilitychange", record);
    return () => {
      unsubscribe(); window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", record);
    };
  }, [pathname]);
  return null;
}

"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const CHANGE_EVENT = "jobping-saved-roles-change";

export function useSavedJob(id: string | number) {
  const key = `jobping:saved-job:${id}`;
  const [error, setError] = useState<string | null>(null);
  const subscribe = useCallback((notify: () => void) => {
    const changed = (event: StorageEvent) => { if (!event.key || event.key === key) notify(); };
    window.addEventListener("storage", changed);
    window.addEventListener(CHANGE_EVENT, notify);
    return () => {
      window.removeEventListener("storage", changed);
      window.removeEventListener(CHANGE_EVENT, notify);
    };
  }, [key]);
  const snapshot = useCallback(() => {
    try { return window.localStorage.getItem(key) === "1"; }
    catch { return false; }
  }, [key]);
  const saved = useSyncExternalStore(subscribe, snapshot, () => false);
  const toggle = () => {
    try {
      if (snapshot()) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, "1");
      setError(null);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch { setError("Saving is unavailable in this browser."); }
  };
  return { saved, toggle, error };
}

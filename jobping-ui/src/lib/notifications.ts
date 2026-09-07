import type { User } from "firebase/auth";
import { auth } from "./firebase";

export const notificationApiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export interface NotificationSettings {
  alerts: boolean;
  recap: boolean;
  job_types: ("internship" | "new_grad")[];
  seasons: (2026 | 2027)[];
  timezone: string;
  email: string;
  verified: boolean;
  provider: "shared" | "byok";
  sender: string | null;
  status: string;
  next_recap: string | null;
  key_configured: boolean;
  webhook_configured: boolean;
  webhook_path: string | null;
  paused_until: string | null;
  last_delivery_status: string | null;
  last_error: string | null;
  sending_enabled: boolean;
}

export interface Recap {
  id: string;
  window_start: string;
  window_end: string;
  jobs: {
    id: number;
    title: string;
    company: string;
    location: string;
    job_type: string;
    season: number;
    closed: boolean;
    apply_url: string;
  }[];
}

export async function notificationRequest<T>(
  user: User,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await user.getIdToken();
  const response = await fetch(`${notificationApiUrl}/api/v1${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json().catch(() => null);
  if (auth.currentUser?.uid !== user.uid)
    throw new Error("Your account changed. Please reload your preferences.");
  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Could not complete the request. Please try again.",
    );
  }
  return data as T;
}

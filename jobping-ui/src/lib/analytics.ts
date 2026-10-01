const analyticsApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export interface FeedActivityFilters {
  category: "All" | "Summer 2027" | "New Grad";
  remote_only: boolean;
  date_filter: "All Time" | "Past 24 hours" | "Past Week" | "Past Month";
  company: string | null;
  search_used: boolean;
}

export async function trackActivity(
  kind: "page_view" | "heartbeat" | "filter_change" | "job_click",
  page: string,
  extra: { filters?: FeedActivityFilters; job_id?: number } = {},
) {
  try {
    const { auth } = await import("./firebase");
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    if (auth.currentUser?.uid !== user.uid) return;
    await fetch(`${analyticsApiUrl}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: crypto.randomUUID(), kind, page, ...extra }),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt browsing or opening an employer's page.
  }
}

export interface EmailCounts {
  sent: number; delivered: number; pending: number; failed: number;
  bounced: number; complained: number; reconcile: number;
}
export interface ActivitySummary {
  days: number; timezone: string; page_views: number; filter_changes: number; job_clicks: number;
  tracking_started_at: string | null;
  trend: { date: string; active_users: number; page_views: number }[];
  filters: Record<string, { value: string; count: number }[]>;
}
export interface AnalyticsSummary {
  activity: ActivitySummary; emails: EmailCounts;
  active_users?: Record<string, number>; tracked_users?: number;
  jobs_discovered?: number; jobs_open?: number; discovery_occurrences?: number;
  reposted_occurrences?: number; email_subscribers?: number; matched_occurrences?: number;
  preferences?: { alerts: boolean; recap: boolean; job_types: string[]; seasons: number[]; timezone: string } | null;
}

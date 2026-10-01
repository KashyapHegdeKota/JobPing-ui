"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { notificationRequest } from "../lib/notifications";
import type { AnalyticsSummary } from "../lib/analytics";

export default function AnalyticsDashboard({ site = false }: { site?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<{ key: string; data?: AnalyticsSummary; error?: string } | null>(null);
  const [refresh, setRefresh] = useState(0);
  const requestKey = JSON.stringify([user?.uid, site, days, refresh]);
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? "" : "";
  useEffect(() => onAuthStateChanged(auth, (next) => { setUser(next); setReady(true); }), []);
  useEffect(() => {
    let current = true;
    if (user) {
      notificationRequest<AnalyticsSummary>(user, `/analytics/${site ? "site" : "me"}?days=${days}`)
        .then((data) => { if (current) setResult({ key: requestKey, data }); })
        .catch((e) => { if (current) setResult({ key: requestKey, error: e instanceof Error ? e.message : "Could not load analytics" }); });
    }
    return () => { current = false; };
  }, [user, site, days, refresh, requestKey]);
  const cards: [string, number][] = data ? (site ? [
    ["Active users · 24 hours", data.active_users?.["1"] ?? 0],
    ["Active users · 7 days", data.active_users?.["7"] ?? 0],
    ["Active users · 30 days", data.active_users?.["30"] ?? 0],
    ["Users tracked", data.tracked_users ?? 0], ["Unique jobs discovered", data.jobs_discovered ?? 0],
    ["Open jobs", data.jobs_open ?? 0], ["Repost occurrences", data.reposted_occurrences ?? 0],
    ["Email subscribers", data.email_subscribers ?? 0],
  ] : [["Your page views", data.activity.page_views], ["Your filter changes", data.activity.filter_changes],
       ["Your job-link clicks", data.activity.job_clicks], ["Matching occurrences · all time", data.matched_occurrences ?? 0]]) : [];
  if (data) cards.push(["Emails sent · all time", data.emails.sent], ["Confirmed delivered", data.emails.delivered],
                       ["Emails pending", data.emails.pending], ["Failed emails", data.emails.failed]);
  return <section className="mx-auto max-w-6xl space-y-8 p-6 sm:p-10">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-semibold">{site ? "Site analytics" : "Your activity"}</h1>
        <p className="mt-2 text-sm text-zinc-400">{site ? "Aggregate site totals. Individual activity stays private." : "Only your account’s activity, filters and email totals."}</p></div>
      <div className="flex gap-3"><select aria-label="Analytics period" value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded border border-zinc-700 bg-zinc-900 p-2">
        {[7, 30, 90].map((value) => <option key={value} value={value}>Past {value} days</option>)}</select>
        <button onClick={() => setRefresh((v) => v + 1)} className="rounded border border-zinc-700 px-3 py-2">Refresh</button></div>
    </header>
    {!ready ? <p>Checking your account…</p> : !user ? <p>Sign in from the navigation to see your activity.</p> : error ? <p role="alert">{error}</p> : !data ? <p role="status">Loading analytics…</p> : <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-3 text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p></article>)}</div>
      <p className="text-sm text-zinc-400">Activity covers signed-in visits recorded since {data.activity.tracking_started_at ? new Date(data.activity.tracking_started_at).toLocaleDateString() : "tracking begins"}. Daily buckets use UTC. Sent means accepted by the email provider; confirmed delivery requires webhooks. Job-link clicks do not mean an application was submitted.</p>
      <section><h2 className="mb-3 text-lg font-semibold">Daily activity</h2><div className="max-h-72 overflow-auto rounded border border-zinc-800"><table className="w-full text-left text-sm"><thead><tr className="bg-zinc-900"><th className="p-3">Date · UTC</th>{site && <th className="p-3">Active users</th>}<th className="p-3">Page views</th></tr></thead><tbody>{data.activity.trend.slice().reverse().map((day) => <tr key={day.date} className="border-t border-zinc-800"><td className="p-3">{day.date}</td>{site && <td className="p-3">{day.active_users}</td>}<td className="p-3">{day.page_views}</td></tr>)}</tbody></table></div></section>
      <section><h2 className="mb-3 text-lg font-semibold">{site ? "Filter usage across the site" : "Your filter usage"}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(data.activity.filters).map(([field, values]) => <article key={field} className="rounded border border-zinc-800 p-4"><h3 className="mb-3 font-medium">{{category: "Category", remote_only: "Remote only", date_filter: "Date filter", company: "Company", search_used: "Search used"}[field] ?? field}</h3>{values.length ? values.map((row) => <div key={row.value} className="flex justify-between gap-4 py-1 text-sm text-zinc-400"><span>{["true", "1"].includes(row.value) ? "Yes" : ["false", "0"].includes(row.value) ? "No" : row.value}</span><span>{row.count}</span></div>) : <p className="text-sm text-zinc-500">No filter changes yet.</p>}</article>)}</div></section>
      {!site && data.preferences && <section><h2 className="mb-3 text-lg font-semibold">Your email preferences</h2><p className="text-sm text-zinc-400">Alerts {data.preferences.alerts ? "on" : "off"} · Recap {data.preferences.recap ? "on" : "off"} · {data.preferences.job_types.join(", ")} · {data.preferences.seasons.join(", ")} · {data.preferences.timezone}</p></section>}
    </>}
  </section>;
}

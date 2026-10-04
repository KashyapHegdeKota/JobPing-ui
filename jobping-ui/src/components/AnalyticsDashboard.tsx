"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { notificationRequest } from "../lib/notifications";
import type { AnalyticsSummary } from "../lib/analytics";

const filterLabels: Record<string, string> = { category: "Category", remote_only: "Remote only", date_filter: "Date filter", company: "Company", search_used: "Search used" };
type Result = { key: string; data?: AnalyticsSummary; error?: string };
function displayFilterValue(value: string) { if (["true", "1"].includes(value)) return "Yes"; if (["false", "0"].includes(value)) return "No"; return value; }

export default function AnalyticsDashboard({ site = false }: { site?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<Result | null>(null);
  const [refresh, setRefresh] = useState(0);
  const requestKey = JSON.stringify([user?.uid, site, days, refresh]);
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? "" : "";
  useEffect(() => onAuthStateChanged(auth, (next) => { setUser(next); setReady(true); }), []);
  useEffect(() => {
    let current = true;
    if (user) notificationRequest<AnalyticsSummary>(user, `/analytics/${site ? "site" : "me"}?days=${days}`).then((next) => { if (current) setResult({ key: requestKey, data: next }); }).catch((e) => { if (current) setResult({ key: requestKey, error: e instanceof Error ? e.message : "Could not load analytics" }); });
    return () => { current = false; };
  }, [user, site, days, refresh, requestKey]);
  const cards: [string, number][] = data ? (site ? [["Active users · 24 hours", data.active_users?.["1"] ?? 0], ["Active users · 7 days", data.active_users?.["7"] ?? 0], ["Active users · 30 days", data.active_users?.["30"] ?? 0], ["Users tracked", data.tracked_users ?? 0], ["Unique jobs discovered", data.jobs_discovered ?? 0], ["Open jobs", data.jobs_open ?? 0], ["Repost occurrences", data.reposted_occurrences ?? 0], ["Email subscribers", data.email_subscribers ?? 0]] : [["Your page views", data.activity.page_views], ["Your filter changes", data.activity.filter_changes], ["Your job-link clicks", data.activity.job_clicks], ["Matching occurrences · all time", data.matched_occurrences ?? 0]]) : [];
  if (data) cards.push(["Emails sent · all time", data.emails.sent], ["Confirmed delivered", data.emails.delivered], ["Emails pending", data.emails.pending], ["Failed emails", data.emails.failed]);
  return <section className="analytics-page"><div className="analytics-shell">
    <header className="analytics-header"><div><p className="analytics-kicker">{site ? "OPERATIONS OVERVIEW" : "PERSONAL ACTIVITY"}</p><h1>A clearer picture of your next chapter.</h1><p className="analytics-subtitle">{site ? "Keep a pulse on the community and the roles moving through JobPing." : "See how your search is taking shape, one small signal at a time."}</p></div><div className="analytics-toolbar"><label htmlFor="analytics-period">Period</label><select id="analytics-period" aria-label="Analytics period" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[7, 30, 90].map((value) => <option key={value} value={value}>Past {value} days</option>)}</select><button type="button" onClick={() => setRefresh((v) => v + 1)}>Refresh</button></div></header>
    {!ready ? <p role="status" className="analytics-state">Checking your account…</p> : !user ? <p className="analytics-state">Sign in from the navigation to see your activity.</p> : error ? <p role="alert" className="analytics-state analytics-state-error">{error}</p> : !data ? <p role="status" className="analytics-state">Loading analytics…</p> : <>
      <section aria-label="Summary metrics" className="analytics-card-grid">{cards.map(([label, value], index) => <article key={label} className={`metric-card ${index === 0 ? "metric-card-featured" : ""}`}><p>{label}</p><strong>{value.toLocaleString()}</strong><span>{index === 0 ? "Current period" : "Tracked total"}</span></article>)}</section>
      <p className="analytics-note">Activity covers signed-in visits recorded since {data.activity.tracking_started_at ? new Date(data.activity.tracking_started_at).toLocaleDateString() : "tracking begins"}. Daily buckets use UTC. Sent means accepted by the email provider; confirmed delivery requires webhooks. Job-link clicks do not mean an application was submitted.</p>
      <section className="analytics-section daily-section"><div className="section-heading"><div><p className="analytics-kicker">MOMENTUM</p><h2>Daily activity</h2></div><span>{days} day view · UTC</span></div><div className="daily-chart" aria-label="Daily page views visualization">{data.activity.trend.slice().reverse().map((day) => <div className="chart-column" key={`chart-${day.date}`}><div className="chart-bar" style={{ height: `${Math.max(8, Math.min(100, day.page_views * 18))}%` }} title={`${day.date}: ${day.page_views} page views`} /><span>{day.date.slice(5)}</span></div>)}</div><div className="table-wrap"><table><caption className="sr-only">Daily activity by UTC date</caption><thead><tr><th scope="col">Date · UTC</th>{site && <th scope="col">Active users</th>}<th scope="col">Page views</th></tr></thead><tbody>{data.activity.trend.slice().reverse().map((day) => <tr key={day.date}><td>{day.date}</td>{site && <td>{day.active_users}</td>}<td>{day.page_views}</td></tr>)}</tbody></table></div></section>
      <section className="analytics-section"><div className="section-heading"><div><p className="analytics-kicker">SEARCH SIGNALS</p><h2>{site ? "Filter usage across the site" : "Your filter usage"}</h2></div></div><div className="filter-grid">{Object.entries(data.activity.filters).map(([field, values]) => <article key={field} className="filter-card"><h3>{filterLabels[field] ?? field}</h3>{values.length ? values.map((row) => <div key={row.value} className="filter-row"><span>{displayFilterValue(row.value)}</span><strong>{row.count}</strong></div>) : <p className="empty-copy">No filter changes yet.</p>}</article>)}</div></section>
      {!site && data.preferences && <section className="preferences-card"><div><p className="analytics-kicker">STAY IN THE LOOP</p><h2>Your email preferences</h2><p>Alerts {data.preferences.alerts ? "on" : "off"} · Recap {data.preferences.recap ? "on" : "off"}</p></div><div className="preference-pills"><span>{data.preferences.job_types.join(", ")}</span><span>{data.preferences.seasons.join(", ")}</span><span>{data.preferences.timezone}</span></div></section>}
    </>}</div></section>;
}

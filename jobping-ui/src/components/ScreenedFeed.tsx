"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { notificationRequest, privateRequestScope } from "../lib/notifications";
import { useRequestCooldown } from "../hooks/useRequestCooldown";
import { bucketLabels, parseScreenedPage, type ScreeningBucket, type ScreenedPage } from "../lib/screening";
import JobCard from "./JobCard";
import styles from "./screening.module.css";

export default function ScreenedFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [bucket, setBucket] = useState<ScreeningBucket>("matches");
  const [data, setData] = useState<ScreenedPage | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const generation = useRef(0);
  const cooldown = useRequestCooldown(user ? privateRequestScope(user) : "anonymous-read");
  useEffect(() => onAuthStateChanged(auth, current => {
    generation.current++; setUser(current); setData(null); setPage(1); setError(""); setLoading(false);
  }), []);
  useEffect(() => {
    if (!user?.emailVerified) return;
    const version = ++generation.current;
    const controller = new AbortController();
    queueMicrotask(() => {
      if (version === generation.current && !controller.signal.aborted) {
        setLoading(true); setError("");
      }
    });
    const params = new URLSearchParams({ bucket, page: String(page), page_size: "20" });
    if (search.trim()) params.set("search", search.trim());
    notificationRequest<unknown>(user, `/me/jobs?${params}`, { signal: controller.signal })
      .then(value => { if (version === generation.current && !controller.signal.aborted) setData(parseScreenedPage(value)); })
      .catch(error => { if (version === generation.current && !controller.signal.aborted) setError(error.message); })
      .finally(() => { if (version === generation.current && !controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); };
  }, [user, bucket, page, search, refresh]);
  return (
    <div className={styles.feed}>
      <header className={styles.panel}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.eyebrow}>Personalized screening</p>
            <h1>Know the terms before applying</h1>
            <p className={styles.subtitle}>Current employer evidence compared with your private requirements. Unresolved roles stay available for review.</p>
          </div>
          {user?.emailVerified && (
            <a href="/profile" className={styles.profileLink}>Edit private screening requirements</a>
          )}
        </div>
        {!user?.emailVerified ? (
          <p className={styles.noticeBanner}>Sign in with a verified account to browse your matches. All roles remain available above.</p>
        ) : (
          <>
            {data && !data.profile_configured && (
              <p role="status" className={styles.noticeBanner}>Set at least one requirement in your profile. Unconfigured roles appear in Needs review.</p>
            )}
            <div className={`${styles.actions} ${styles.bucketTabs}`} role="group" aria-label="Screening buckets">
              {(Object.keys(bucketLabels) as ScreeningBucket[]).map(name => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={bucket === name}
                  onClick={() => { setBucket(name); setPage(1); }}
                >
                  {bucketLabels[name]}{data ? ` (${data.counts[name]})` : ""}
                </button>
              ))}
            </div>
            <form
              className={`${styles.actions} ${styles.searchRow}`}
              onSubmit={event => { event.preventDefault(); setSearch(query); setPage(1); }}
            >
              <input
                className={styles.search}
                aria-label="Search screened roles"
                value={query}
                maxLength={500}
                onChange={event => setQuery(event.target.value)}
                placeholder="Job title or company"
              />
              <button type="submit" className={styles.primaryAction} disabled={loading || cooldown > 0}>Search</button>
              <button type="button" className={styles.secondaryAction} disabled={loading || cooldown > 0} onClick={() => setRefresh(value => value + 1)}>Refresh results</button>
            </form>
          </>
        )}
        {loading && <p role="status" className={styles.statusLine}>Updating screened results…</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {cooldown > 0 && <p role="status" className={styles.statusLine}>Try again in {cooldown} seconds.</p>}
      </header>
      <div className={styles.cards}>
        {data?.items.map(job => <JobCard key={job.id} job={job} />)}
      </div>
      {data && !loading && data.items.length === 0 && (
        <p className={`${styles.panel} ${styles.emptyState}`}>No roles in this group match your search.</p>
      )}
      {data && (
        <nav className={`${styles.panel} ${styles.actions} ${styles.pagination}`} aria-label="Screened results pages">
          <button type="button" className={styles.secondaryAction} disabled={loading || cooldown > 0 || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
          <span className={styles.pageMeta}>Page {page} of {Math.max(1, data.total_pages)} · {data.total} roles</span>
          <button type="button" className={styles.secondaryAction} disabled={loading || cooldown > 0 || page >= data.total_pages} onClick={() => setPage(value => value + 1)}>Next</button>
        </nav>
      )}
    </div>
  );
}

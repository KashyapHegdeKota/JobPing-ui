"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Job } from "../hooks/useLiveJobs";
import { auth } from "../lib/firebase";
import { notificationApiUrl, notificationRequest } from "../lib/notifications";
import { limitedFetch } from "../lib/requestCooldown";
import { bucketLabels, parseRestrictions, parseScreening, restrictionNames, type EvidenceResponse } from "../lib/screening";
import { parseJobDetails } from "../lib/parseJobDetails";
import { formatPay, policyNames, safeEvidenceUrl } from "../lib/jobDetails";
import type { PolicyKind } from "../lib/jobDetails";
import { trackActivity } from "../lib/analytics";
import styles from "./screening.module.css";

export default function BeforeApplying({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EvidenceResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const href = safeEvidenceUrl(job.apply_url ?? "");
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const controller = new AbortController();
    const current = auth.currentUser;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const currentAccount = () => !cancelled && auth.currentUser?.uid === current?.uid;
    const returnFocus = trigger.current;
    const unsubscribe = onAuthStateChanged(auth, account => {
      if (account?.uid !== current?.uid) { setData(null); setOpen(false); }
    });
    dialog.current?.focus();
    async function publicRead() {
      const response = await limitedFetch(`${notificationApiUrl}/api/v1/jobs/${job.id}/evidence`, { signal: controller.signal, cache: "no-store" }, "public");
      if (!response.ok) throw new Error("Could not check employer evidence. You can still view the role manually.");
      return response.json() as Promise<EvidenceResponse>;
    }
    async function check() {
      try {
        let result = await publicRead();
        if (!currentAccount()) return;
        // Server enforces the one-hour cache and coalesces pending work.
        if (current?.emailVerified) result = await notificationRequest<EvidenceResponse>(current, `/me/jobs/${job.id}/evidence-check`, { method: "POST", signal: controller.signal });
        if (!currentAccount()) return;
        setData(result); setLoading(false);
        let attempts = 0;
        async function poll() {
          try {
            const next = await publicRead();
            if (!currentAccount()) return;
            if (!["queued", "running"].includes(next.status)) {
              const final = current?.emailVerified ? await notificationRequest<EvidenceResponse>(current, `/me/jobs/${job.id}/evidence-check`, { method: "POST", signal: controller.signal }) : next;
              if (currentAccount()) setData(final);
            } else {
              setData(next);
              if (++attempts < 20) timer = setTimeout(poll, 3000);
            }
          } catch (error) { if (currentAccount()) setError(error instanceof Error ? error.message : "Could not refresh evidence."); }
        }
        if (["queued", "running"].includes(result.status)) timer = setTimeout(poll, 3000);
      } catch (error) { if (currentAccount()) { setError(error instanceof Error ? error.message : "Could not check evidence."); setLoading(false); } }
    }
    void check();
    return () => { cancelled = true; controller.abort(); unsubscribe(); if (timer) clearTimeout(timer); returnFocus?.focus(); };
  }, [open, job.id, refresh]);
  const details = parseJobDetails(data?.details);
  const restrictions = parseRestrictions(data?.details);
  const result = parseScreening(data?.screening);
  return <>
    <button type="button" ref={trigger} className={styles.button} onClick={() => { setLoading(true); setData(null); setError(""); setOpen(true); }}>Check before applying</button>
    {open && <div className={styles.overlay}><div ref={dialog} role="dialog" aria-modal="true" aria-label="Check before applying" tabIndex={-1} className={`${styles.panel} ${styles.dialog}`} onKeyDown={event => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]');
        if (controls?.length) { const first = controls[0]; const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
    }}>
      <div className={styles.dialogHeader}>
        <h2>{job.title}</h2>
        <p className={styles.dialogSub}>{job.company} · {job.location}</p>
      </div>
      {loading && <p role="status" className={styles.statusLine}>Reading cached employer evidence…</p>}
      {result && <div className={`${styles.summary} ${result.bucket === "excluded" ? styles.summaryExcluded : result.bucket === "review" ? styles.summaryReview : ""}`}><strong>{bucketLabels[result.bucket]}</strong><ul>{result.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}
      {data && <p role="status" className={styles.statusLine}>{["queued", "running"].includes(data.status) ? "Checking public employer pages. Unresolved terms still need review." : data.fresh ? "Public employer pages checked." : "Couldn’t verify current employer terms."}</p>}
      {data?.verified_at && <p className={styles.metaLine}>Last complete check: {new Date(data.verified_at).toLocaleString()}</p>}
      {!auth.currentUser?.emailVerified && <p className={styles.noticeBanner}>Sign in with a verified account to refresh evidence and compare your private requirements.</p>}
      {details?.compensation.map((pay, index) => <div key={index} className={styles.evidenceBlock}><strong>{formatPay(pay)}</strong>{pay.location && <p className={styles.metaLine}>{pay.location}</p>}<blockquote>{pay.excerpt}</blockquote></div>)}
      {Object.entries(details?.policies ?? {}).map(([name, fact]) => fact && <section key={name} className={styles.evidenceBlock}><strong>{policyNames[name as PolicyKind]}: {fact.value}</strong>{fact.evidence.map((item, index) => <blockquote key={index}>{item.excerpt} {safeEvidenceUrl(item.source_url) && <a href={item.source_url} target="_blank" rel="noopener noreferrer">Employer source</a>}</blockquote>)}</section>)}
      {Object.entries(restrictions).map(([name, fact]) => fact && <section key={name} className={styles.evidenceBlock}><strong>{restrictionNames[name as keyof typeof restrictionNames]}: {fact.value}</strong>{fact.evidence.map((item, index) => <blockquote key={index}>{item.excerpt} <a href={item.source_url} target="_blank" rel="noopener noreferrer">Employer source</a></blockquote>)}</section>)}
      {!details?.compensation.length && <p className={styles.metaLine}>Applicable base pay not stated on checked pages.</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <p className={styles.note}>An advertised range is not an offer. Terms behind login or answer-dependent steps remain unresolved.</p>
      <div className={`${styles.actions} ${styles.dialogFooter}`}><button type="button" className={styles.secondaryAction} onClick={() => setOpen(false)}>Close</button><button type="button" className={styles.secondaryAction} disabled={loading} onClick={() => { setLoading(true); setError(""); setData(null); setRefresh(value => value + 1); }}>Refresh check</button>
      {href && <a href={href} target="_blank" rel="noopener noreferrer" className={styles.primaryLink} onClick={() => { const id = Number(job.id); if (Number.isSafeInteger(id) && id > 0) void trackActivity("job_click", "/", { job_id: id }); }}>Continue to employer manually</a>}</div>
    </div></div>}
  </>;
}

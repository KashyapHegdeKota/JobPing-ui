"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  notificationRequest,
  type Recap,
  type RecapJob,
} from "../lib/notifications";
import AuthModal from "./AuthModal";
import styles from "./notification-recap.module.css";

function RecapJobCard({ job }: { job: RecapJob }) {
  return (
    <article className={styles.card}>
      {job.kind === "reposted" && (
        <p className={styles.badge}>
          REPOSTED
        </p>
      )}
      <p className={styles.company}>{job.company}</p>
      <h3 className={styles.jobTitle}>{job.title}</h3>
      <p className={styles.meta}>
        {job.location || "Location not listed"} · {job.job_type} · {job.season} ·{" "}
        {job.date_text}
      </p>
      {job.closed ? (
        <p className={styles.closed}>Applications closed</p>
      ) : (
        /^https?:\/\//i.test(job.apply_url) && (
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.apply}
          >
            Apply now
          </a>
        )
      )}
    </article>
  );
}

export default function NotificationRecap({ id }: { id: string }) {
  const [recap, setRecap] = useState<Recap | null>(null);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const request = ++generation;
      setSignedOut(!user);
      setRecap(null);
      setError("");
      if (user)
        notificationRequest<Recap>(user, `/me/recaps/${encodeURIComponent(id)}`)
          .then((data) => {
            if (request === generation) setRecap(data);
          })
          .catch((e: Error) => {
            if (request === generation) setError(e.message);
          });
    });
    return () => {
      generation++;
      unsubscribe();
    };
  }, [id]);
  const newJobs = recap?.jobs.filter((job) => job.kind !== "reposted") ?? [];
  const repostedJobs = recap?.jobs.filter((job) => job.kind === "reposted") ?? [];

  return (
    <div className={styles.page}>
      <Link href="/profile" className={styles.back}>
        ← Email preferences
      </Link>
      <h1 className={styles.title}>Your daily recap</h1>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {signedOut ? (
        <div className={styles.auth}>
          <p>
            Sign in to view your personal recap.
          </p>
          <button
            className={styles.button}
            onClick={() => setAuthOpen(true)}
          >
            Sign in
          </button>
        </div>
      ) : recap ? (
        <>
          <p className={styles.summary}>
            {recap.total_matches} matches · {recap.new_count} new ·{" "}
            {recap.reposted_count} reposted
          </p>
          <p className={styles.window}>
            {new Date(recap.window_start).toLocaleString()} –{" "}
            {new Date(recap.window_end).toLocaleString()}
          </p>
          <div>
            {newJobs.length > 0 && (
              <section className={styles.section} aria-labelledby="new-jobs-heading">
                <h2
                  id="new-jobs-heading"
                  className={styles.sectionTitle}
                >
                  NEW JOBS · {recap.new_count}
                </h2>
                <div className={styles.cards}>
                  {newJobs.map((job) => (
                    <RecapJobCard key={job.occurrence_id} job={job} />
                  ))}
                </div>
              </section>
            )}
            {repostedJobs.length > 0 && (
              <section className={styles.section} aria-labelledby="reposted-jobs-heading">
                <h2
                  id="reposted-jobs-heading"
                  className={styles.sectionTitle}
                >
                  REPOSTED JOBS · {recap.reposted_count}
                </h2>
                <div className={styles.cards}>
                  {repostedJobs.map((job) => (
                    <RecapJobCard key={job.occurrence_id} job={job} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      ) : (
        !error && (
          <p role="status" className={styles.loading}>
            Loading recap…
          </p>
        )
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

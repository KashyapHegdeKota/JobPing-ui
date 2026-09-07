"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { notificationRequest, type Recap } from "../lib/notifications";
import AuthModal from "./AuthModal";

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
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/profile" className="text-sm text-cyan-400">
        ← Email preferences
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Your daily recap</h1>
      {error && (
        <p role="alert" className="mt-6 text-red-300">
          {error}
        </p>
      )}
      {signedOut ? (
        <div className="mt-6">
          <p className="mb-4 text-zinc-400">
            Sign in to view your personal recap.
          </p>
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2 text-zinc-950"
            onClick={() => setAuthOpen(true)}
          >
            Sign in
          </button>
        </div>
      ) : recap ? (
        <>
          <p className="mt-3 text-sm text-zinc-400">
            {recap.jobs.length} matches ·{" "}
            {new Date(recap.window_start).toLocaleString()} –{" "}
            {new Date(recap.window_end).toLocaleString()}
          </p>
          <div className="mt-8 space-y-4">
            {recap.jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
              >
                <p className="text-sm text-cyan-300">{job.company}</p>
                <h2 className="mt-2 text-lg font-medium">{job.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {job.location || "Location not listed"} · {job.job_type} ·{" "}
                  {job.season}
                </p>
                {job.closed ? (
                  <p className="mt-4 text-sm text-zinc-500">
                    Applications closed
                  </p>
                ) : (
                  /^https?:\/\//i.test(job.apply_url) && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950"
                    >
                      Apply now
                    </a>
                  )
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        !error && (
          <p role="status" className="mt-6 text-zinc-400">
            Loading recap…
          </p>
        )
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

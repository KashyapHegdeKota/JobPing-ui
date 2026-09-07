"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { Bell, Check, KeyRound, Mail, RefreshCw } from "lucide-react";
import { auth } from "../lib/firebase";
import {
  notificationApiUrl,
  notificationRequest,
  type NotificationSettings,
} from "../lib/notifications";
import AuthModal from "./AuthModal";

const control =
  "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50";
const button =
  "rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed";
const secondary =
  "rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50";

function statusText(status: string): string {
  const labels: Record<string, string> = {
    ready: "Ready to send",
    needs_test: "Send a test to finish setup",
    configuration_error: "Email setup needs attention",
    sender_error: "Check your sending domain and API key",
    suppressed: "Email paused after a bounce or complaint. Contact support.",
    pending: "Queued",
    accepted: "Accepted by Resend",
    delivered: "Delivered",
    failed: "Sending failed",
    reconcile: "Delivery needs review",
    quota_paused: "Individual alerts paused; matches remain in your recap",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

export default function NotificationProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [sender, setSender] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [timezones] = useState(() => {
    try {
      return ["UTC", ...Intl.supportedValuesOf("timeZone")];
    } catch {
      return [
        "UTC",
        "America/Phoenix",
        "America/New_York",
        "Europe/London",
        "Asia/Kolkata",
      ];
    }
  });

  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      const request = ++generation;
      setUser(current);
      setSettings(null);
      setApiKey("");
      setWebhookSecret("");
      setError("");
      setMessage("");
      if (!current) {
        setLoading(false);
        return;
      }
      setLoading(true);
      notificationRequest<NotificationSettings>(
        current,
        `/me/notification-settings?timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")}`,
      )
        .then((data) => {
          if (request !== generation) return;
          setSettings(data);
          setSender(data.sender ?? "");
        })
        .catch((e: Error) => {
          if (request === generation) setError(e.message);
        })
        .finally(() => {
          if (request === generation) setLoading(false);
        });
    });
    return () => {
      generation++;
      unsubscribe();
    };
  }, []);

  async function action(run: (current: User) => Promise<void>) {
    if (!user) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await run(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh(current: User) {
    await current.reload();
    await current.getIdToken(true);
    const next = await notificationRequest<NotificationSettings>(
      current,
      "/me/notification-settings",
    );
    if (auth.currentUser?.uid === current.uid) setSettings(next);
  }

  function set<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) {
    setSettings((old) => (old ? { ...old, [key]: value } : old));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
        Your JobPing
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Email notifications
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
        A heads-up when the right job appears. One thoughtful recap at the end
        of your day.
      </p>
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mt-6 flex gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200"
        >
          <Check size={18} />
          {message}
        </div>
      )}
      {loading ? (
        <p className="mt-10 text-zinc-400" role="status">
          Loading your preferences…
        </p>
      ) : !user ? (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <Mail className="mb-4 text-cyan-400" />
          <h2 className="text-lg font-medium">
            Your next opportunity, in your inbox.
          </h2>
          <p className="my-3 text-sm text-zinc-400">
            Sign in to choose your job preferences and enable email updates.
          </p>
          <button className={button} onClick={() => setAuthOpen(true)}>
            Sign in
          </button>
        </section>
      ) : settings ? (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 p-5">
            <div>
              <p className="text-sm font-medium">{settings.email}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {settings.verified
                  ? "Verified email"
                  : "Email verification needed"}{" "}
                · {statusText(settings.status)}
              </p>
            </div>
            <button
              aria-label="Refresh email status"
              className={secondary}
              disabled={busy}
              onClick={() => action(refresh)}
            >
              <RefreshCw size={16} />
            </button>
            {!settings.verified && (
              <div className="w-full border-t border-zinc-800 pt-4">
                <p className="mb-3 text-sm text-zinc-400">
                  Verify your address before turning on emails. After following
                  the verification link, refresh your status here.
                </p>
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() =>
                    action(async (current) => {
                      await sendEmailVerification(current);
                      setMessage("Verification email sent. Check your inbox.");
                    })
                  }
                >
                  Send verification email
                </button>
              </div>
            )}
          </div>
          {!settings.sending_enabled && (
            <p className="mt-4 text-sm text-amber-200">
              Email sending is not yet enabled by JobPing. You can save your
              preferences now.
            </p>
          )}
          {settings.paused_until &&
            new Date(settings.paused_until) > new Date() && (
              <p role="status" className="mt-4 text-sm text-amber-200">
                Email quota reached. Sending can resume after{" "}
                {new Date(settings.paused_until).toLocaleString()}.
              </p>
            )}
          {settings.last_error && (
            <p className="mt-3 text-sm text-amber-200">
              {statusText(settings.last_error)}
            </p>
          )}
          <form
            className="mt-6 space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              action(async (current) => {
                const { alerts, recap, job_types, seasons, timezone } =
                  settings;
                const next = await notificationRequest<NotificationSettings>(
                  current,
                  "/me/notification-settings",
                  {
                    method: "PUT",
                    body: JSON.stringify({
                      alerts,
                      recap,
                      job_types,
                      seasons,
                      timezone,
                    }),
                  },
                );
                setSettings(next);
                setMessage("Your notification preferences are saved.");
              });
            }}
          >
            <fieldset
              disabled={busy}
              className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
            >
              <legend className="sr-only">Notification preferences</legend>
              <label className="flex cursor-pointer items-start gap-4">
                <Bell className="mt-1 shrink-0 text-cyan-400" size={20} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    New job alerts
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-400">
                    One email for each new match, while your sending allowance
                    is available.
                  </span>
                </span>
                <input
                  aria-label="New job alerts"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-cyan-400"
                  checked={settings.alerts}
                  onChange={(e) => set("alerts", e.target.checked)}
                  disabled={
                    !settings.verified || settings.status === "suppressed"
                  }
                />
              </label>
              <div className="border-t border-zinc-800" />
              <label className="flex cursor-pointer items-start gap-4">
                <Mail className="mt-1 shrink-0 text-cyan-400" size={20} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">Daily recap</span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-400">
                    All matching jobs since your previous recap, together in one
                    email at 8 PM. Includes jobs already sent as alerts.
                  </span>
                </span>
                <input
                  aria-label="Daily recap"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-cyan-400"
                  checked={settings.recap}
                  onChange={(e) => set("recap", e.target.checked)}
                  disabled={
                    !settings.verified || settings.status === "suppressed"
                  }
                />
              </label>
              <label className="block text-sm">
                Your timezone
                <select
                  className={`${control} mt-2 w-full`}
                  value={settings.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                >
                  {[...new Set([settings.timezone, ...timezones])].map(
                    (zone) => (
                      <option key={zone}>{zone}</option>
                    ),
                  )}
                </select>
              </label>
              {settings.next_recap && (
                <p className="text-xs text-zinc-400">
                  Next recap:{" "}
                  {new Date(settings.next_recap).toLocaleString(undefined, {
                    timeZone: settings.timezone,
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  . No email on days without matches.
                </p>
              )}
            </fieldset>
            <fieldset
              disabled={busy}
              className="rounded-xl border border-zinc-800 p-6"
            >
              <legend className="px-2 text-sm font-medium">
                Jobs you want to hear about
              </legend>
              <p className="mb-5 text-sm text-zinc-400">
                These saved preferences apply to email, independently of your
                feed filters.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
                    Job type
                  </p>
                  {(["internship", "new_grad"] as const).map((type) => (
                    <label
                      key={type}
                      className="mb-3 flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-cyan-400"
                        checked={settings.job_types.includes(type)}
                        onChange={(e) =>
                          set(
                            "job_types",
                            e.target.checked
                              ? [...settings.job_types, type]
                              : settings.job_types.filter((v) => v !== type),
                          )
                        }
                      />
                      {type === "internship"
                        ? "Internships"
                        : "New graduate roles"}
                    </label>
                  ))}
                </div>
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
                    Hiring season
                  </p>
                  {([2026, 2027] as const).map((year) => (
                    <label
                      key={year}
                      className="mb-3 flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-cyan-400"
                        checked={settings.seasons.includes(year)}
                        onChange={(e) =>
                          set(
                            "seasons",
                            e.target.checked
                              ? [...settings.seasons, year]
                              : settings.seasons.filter((v) => v !== year),
                          )
                        }
                      />
                      {year}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
            <button
              className={button}
              disabled={
                busy || !settings.job_types.length || !settings.seasons.length
              }
            >
              Save preferences
            </button>
          </form>
          <details className="mt-10 rounded-xl border border-zinc-800 p-6">
            <summary className="cursor-pointer text-sm font-medium">
              <KeyRound className="mr-2 inline text-cyan-400" size={18} />
              Use your own Resend account{" "}
              <span className="ml-2 text-xs text-zinc-500">Optional</span>
            </summary>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              JobPing includes a shared email allowance for the first ten
              subscribers. Connect your own Resend account to use its allowance
              instead. You need a verified sending domain in that account.
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Use a sending-only API key restricted to your domain. Your key is
              encrypted and never shown again. If your account encounters an
              error, sending pauses without using JobPing’s allowance.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                action(async (current) => {
                  try {
                    const next =
                      await notificationRequest<NotificationSettings>(
                        current,
                        "/me/email-provider",
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            api_key: apiKey,
                            sender,
                            webhook_secret: webhookSecret || null,
                          }),
                        },
                      );
                    setSettings(next);
                    setMessage(
                      "Connection saved. Send a test email to finish setup.",
                    );
                  } finally {
                    setApiKey("");
                    setWebhookSecret("");
                  }
                });
              }}
            >
              <label className="block text-sm">
                Verified sender address
                <input
                  required
                  type="email"
                  className={`${control} mt-2 w-full`}
                  placeholder="alerts@your-domain.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="block text-sm">
                Resend API key
                <input
                  required
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${control} mt-2 w-full`}
                  placeholder={
                    settings.key_configured ? "Enter a replacement key" : "re_…"
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="block text-sm">
                Webhook signing secret{" "}
                <span className="text-zinc-500">(optional)</span>
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${control} mt-2 w-full`}
                  placeholder="whsec_…"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  disabled={busy}
                />
              </label>
              <button className={secondary} disabled={busy}>
                {settings.key_configured
                  ? "Replace connection"
                  : "Save connection"}
              </button>
            </form>
            {settings.provider === "byok" && (
              <div className="mt-5 space-y-4 border-t border-zinc-800 pt-5">
                <p className="text-sm">
                  {statusText(settings.status)}
                  {settings.last_delivery_status
                    ? ` · Last email: ${statusText(settings.last_delivery_status)}`
                    : ""}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className={button}
                    disabled={busy || !settings.verified}
                    onClick={() =>
                      action(async (current) => {
                        await notificationRequest(
                          current,
                          "/me/email-provider/test",
                          { method: "POST" },
                        );
                        setMessage(
                          "Test queued. Check your inbox, then refresh your status. This uses one email from your Resend allowance.",
                        );
                      })
                    }
                  >
                    Send test email
                  </button>
                  <button
                    className={secondary}
                    disabled={busy}
                    onClick={() =>
                      action(async (current) => {
                        const next =
                          await notificationRequest<NotificationSettings>(
                            current,
                            "/me/email-provider",
                            { method: "DELETE" },
                          );
                        setSettings(next);
                        setSender("");
                        setApiKey("");
                        setWebhookSecret("");
                        setMessage(
                          "Connection removed. Enable your preferred emails and save to request a shared place.",
                        );
                      })
                    }
                  >
                    Remove connection
                  </button>
                </div>
                <p className="text-xs leading-5 text-zinc-400">
                  To track delivery and stop sending after bounces or
                  complaints, add this endpoint in Resend for email.delivered,
                  email.bounced, and email.complained. Then replace the
                  connection with its signing secret.
                </p>
                <code className="block break-all rounded bg-zinc-950 p-3 text-xs text-cyan-200">
                  {notificationApiUrl}
                  {settings.webhook_path}
                </code>
                <p className="text-xs text-zinc-500">
                  {settings.webhook_configured
                    ? "Webhook signing secret saved."
                    : "Without a webhook, status confirms acceptance by Resend, not inbox delivery."}
                </p>
              </div>
            )}
          </details>
        </>
      ) : (
        <button
          className={`${secondary} mt-6`}
          disabled={busy}
          onClick={() => action(refresh)}
        >
          Retry loading preferences
        </button>
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

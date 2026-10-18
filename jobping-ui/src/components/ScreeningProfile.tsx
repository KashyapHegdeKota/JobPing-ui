"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { notificationRequest, privateRequestScope } from "../lib/notifications";
import { useRequestCooldown } from "../hooks/useRequestCooldown";
import { defaultRequirements, type ProfileResponse, type Requirements } from "../lib/screening";
import styles from "./screening.module.css";

export default function ScreeningProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [requirements, setRequirements] = useState<Requirements>(defaultRequirements);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const generation = useRef(0);
  const inFlight = useRef(false);
  const cooldown = useRequestCooldown(user ? privateRequestScope(user, "PUT") : "anonymous-write");
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, current => {
      const version = ++generation.current;
      setBusy(false);
      setUser(current); setRequirements(defaultRequirements); setError(""); setMessage("");
      if (!current || !current.emailVerified) { setLoading(false); return; }
      setLoading(true);
      notificationRequest<ProfileResponse>(current, "/me/screening-profile")
        .then(data => { if (active && version === generation.current) setRequirements(data.requirements); })
        .catch(error => { if (active && version === generation.current) setError(error.message); })
        .finally(() => { if (active && version === generation.current) setLoading(false); });
    });
    return () => { active = false; unsubscribe(); };
  }, []);
  async function save(remove = false) {
    if (!user || inFlight.current || cooldown) return;
    const version = generation.current;
    inFlight.current = true; setBusy(true); setError(""); setMessage("");
    try {
      if (remove) {
        await notificationRequest(user, "/me/screening-profile", { method: "DELETE" });
        if (version === generation.current) { setRequirements(defaultRequirements); setMessage("Screening requirements deleted."); }
      } else {
        const data = await notificationRequest<ProfileResponse>(user, "/me/screening-profile", { method: "PUT", body: JSON.stringify(requirements) });
        if (version === generation.current) { setRequirements(data.requirements); setMessage("Your private screening requirements are saved."); }
      }
    } catch (error) { if (version === generation.current) setError(error instanceof Error ? error.message : "Could not save requirements."); }
    finally { inFlight.current = false; if (version === generation.current) setBusy(false); }
  }
  function set<K extends keyof Requirements>(key: K, value: Requirements[K]) { setRequirements(old => ({ ...old, [key]: value })); }
  return (
    <div className={styles.profileShell}>
      <section className={`${styles.panel} ${styles.profilePanel}`} aria-label="Private job screening">
        <p className={styles.eyebrow}>Private screening</p>
        <h2>Check the fit before applying</h2>
        <p className={styles.subtitle}>Choose the employer statements and base pay you need for US roles. Your requirements stay private to your account and do not change email matching.</p>
        {loading ? (
          <p role="status" className={styles.statusLine}>Loading screening requirements…</p>
        ) : !user?.emailVerified ? (
          <p className={styles.noticeBanner}>Sign in with a verified account to save private screening requirements.</p>
        ) : (
          <form className={styles.form} onSubmit={event => { event.preventDefault(); void save(); }}>
            <fieldset className={styles.fieldset} disabled={busy || cooldown > 0}>
              <legend className={styles.fieldLegend}>Work authorization and base-pay targets</legend>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  <span>Current authorization requirement</span>
                  <select value={requirements.authorization ?? ""} onChange={event => set("authorization", (event.target.value || null) as Requirements["authorization"])}>
                    <option value="">No requirement selected</option>
                    <option value="cpt">Explicit CPT acceptance</option>
                    <option value="opt">Explicit OPT acceptance</option>
                    <option value="stem_opt">Explicit STEM OPT support</option>
                    <option value="unrestricted">No temporary-authorization check needed</option>
                  </select>
                </label>
                <label className={styles.checkboxCard}>
                  <span>
                    <input type="checkbox" checked={requirements.future_sponsorship} onChange={event => set("future_sponsorship", event.target.checked)} /> Require explicit future sponsorship
                  </span>
                </label>
                <label className={styles.formField}>
                  <span>Internship hourly base-pay target (USD)</span>
                  <input type="number" min="0" max="100000000" step="0.01" placeholder="e.g. 45.00" value={requirements.internship_hourly ?? ""} onChange={event => set("internship_hourly", event.target.value || null)} />
                </label>
                <label className={styles.formField}>
                  <span>New-grad annual base-pay target (USD)</span>
                  <input type="number" min="0" max="100000000" step="0.01" placeholder="e.g. 125000" value={requirements.new_grad_annual ?? ""} onChange={event => set("new_grad_annual", event.target.value || null)} />
                </label>
                <label className={`${styles.formField} ${styles.formFieldFull}`}>
                  <span>Accepted US work locations, separated by semicolons</span>
                  <input value={requirements.locations.join("; ")} onChange={event => set("locations", event.target.value.split(";").map(value => value.trim()).filter(Boolean))} placeholder="Leave empty for all US locations" />
                </label>
              </div>
              <p className={styles.note}>Use exact employer location labels. A salary range matches when its advertised maximum reaches your target; the actual offer may be lower. Unknown terms go to Needs review.</p>
            </fieldset>
            <div className={styles.actions}>
              <button className={styles.primaryAction} disabled={busy || cooldown > 0} type="submit">Save screening requirements</button>
              <button className={styles.secondaryAction} disabled={busy || cooldown > 0} type="button" onClick={() => void save(true)}>Delete screening requirements</button>
            </div>
          </form>
        )}
        {cooldown > 0 && <p role="status" className={styles.statusLine}>Please wait {cooldown} seconds before changing requirements.</p>}
        {message && <p role="status" className={styles.successBanner}>{message}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    </div>
  );
}

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
  return <section className={styles.panel} aria-label="Private job screening">
    <h2>Check the fit before applying</h2>
    <p>Choose the employer statements and base pay you need for US roles. Your requirements stay private to your account and do not change email matching.</p>
    {loading ? <p role="status">Loading screening requirements…</p> : !user?.emailVerified ? <p>Sign in with a verified account to save private screening requirements.</p> : <form className={styles.form} onSubmit={event => { event.preventDefault(); void save(); }}>
      <fieldset disabled={busy || cooldown > 0}>
        <legend>Work authorization and base-pay targets</legend>
        <label>Current authorization requirement<select value={requirements.authorization ?? ""} onChange={event => set("authorization", (event.target.value || null) as Requirements["authorization"])}>
          <option value="">No requirement selected</option><option value="cpt">Explicit CPT acceptance</option><option value="opt">Explicit OPT acceptance</option><option value="stem_opt">Explicit STEM OPT support</option><option value="unrestricted">No temporary-authorization check needed</option>
        </select></label>
        <label><span><input type="checkbox" checked={requirements.future_sponsorship} onChange={event => set("future_sponsorship", event.target.checked)} /> Require explicit future sponsorship</span></label>
        <label>Internship hourly base-pay target (USD)<input type="number" min="0" max="100000000" step="0.01" value={requirements.internship_hourly ?? ""} onChange={event => set("internship_hourly", event.target.value || null)} /></label>
        <label>New-grad annual base-pay target (USD)<input type="number" min="0" max="100000000" step="0.01" value={requirements.new_grad_annual ?? ""} onChange={event => set("new_grad_annual", event.target.value || null)} /></label>
        <label>Accepted US work locations, separated by semicolons<input value={requirements.locations.join("; ")} onChange={event => set("locations", event.target.value.split(";").map(value => value.trim()).filter(Boolean))} placeholder="Leave empty for all US locations" /></label>
        <p className={styles.note}>Use exact employer location labels. A salary range matches when its advertised maximum reaches your target; the actual offer may be lower. Unknown terms go to Needs review.</p>
      </fieldset>
      <div className={styles.actions}><button disabled={busy || cooldown > 0} type="submit">Save screening requirements</button><button disabled={busy || cooldown > 0} type="button" onClick={() => void save(true)}>Delete screening requirements</button></div>
    </form>}
    {cooldown > 0 && <p role="status">Please wait {cooldown} seconds before changing requirements.</p>}
    {message && <p role="status">{message}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
  </section>;
}

"use client";

import { Check, Copy, Gift, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./referrals.module.css";

const referralLink = "https://jobping.com?ref=jp_usr_9a8b7c6d";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // The URL remains selectable when clipboard permission is unavailable.
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>JobPing community</p>
          <h1>Referral program</h1>
          <p className={styles.intro}>
            Share JobPing with people who are looking for their next opportunity.
          </p>
        </header>

        <section className={styles.card} aria-labelledby="your-link-title">
          <div className={styles.cardHeading}>
            <div className={`${styles.iconTile} ${styles.mintTile}`} aria-hidden="true">
              <Gift size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 id="your-link-title">Your referral link</h2>
              <p>Copy your link and share it with a friend.</p>
            </div>
          </div>

          <div className={styles.linkRow}>
            <label className={styles.srOnly} htmlFor="referral-link">Referral link</label>
            <input id="referral-link" className={styles.linkInput} readOnly value={referralLink} />
            <button className={styles.primaryButton} type="button" onClick={handleCopy}>
              {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              <span>{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
          <p className={styles.note}>
            Sample link for this interface. Account referral links are not connected yet.
          </p>
          <p className={styles.srOnly} role="status" aria-live="polite">
            {copied ? "Referral link copied to clipboard." : ""}
          </p>
        </section>

        <section className={styles.card} aria-labelledby="apply-code-title">
          <div className={styles.cardHeading}>
            <div className={`${styles.iconTile} ${styles.blueTile}`} aria-hidden="true">
              <UserPlus size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 id="apply-code-title">Apply a code</h2>
              <p>Have a code from a friend? You can add it here later.</p>
            </div>
          </div>

          <div className={styles.linkRow}>
            <label className={styles.srOnly} htmlFor="referral-code">Referral code</label>
            <input id="referral-code" className={styles.linkInput} type="text" placeholder="Enter a referral code" disabled aria-describedby="apply-code-note" />
            <button className={styles.secondaryButton} type="button" disabled>Apply</button>
          </div>
          <p className={styles.note} id="apply-code-note">Applying referral codes is not connected yet.</p>
        </section>
      </div>
    </main>
  );
}

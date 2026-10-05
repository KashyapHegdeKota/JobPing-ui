"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { X, BriefcaseBusiness } from "lucide-react";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onAuthenticated?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = "signup", onAuthenticated }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, input, a[href]') ?? []).filter((element) => !element.hasAttribute('disabled')); 
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
      onAuthenticated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      onClose();
      onAuthenticated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="auth-heading">
        <button type="button" onClick={onClose} className={styles.close} aria-label="Close sign-in dialog"><X size={19} aria-hidden="true" /></button>
        <div className={styles.story}>
          <span className={styles.mark}><BriefcaseBusiness size={26} aria-hidden="true" /></span>
          <h2>Your next chapter starts with a ping.</h2>
          <p>Fresh opportunities. Thoughtful alerts. A little less searching, a little more possibility.</p>
        </div>
        <div className={styles.formPane}>
          <h2 id="auth-heading">{isSignUp ? "Make your next move." : "Welcome back."}</h2>
          <div className={styles.tabs}>
            <button type="button" aria-pressed={!isSignUp} onClick={() => setIsSignUp(false)}>Sign in</button>
            <button type="button" aria-pressed={isSignUp} onClick={() => setIsSignUp(true)}>Sign up</button>
          </div>
          <button type="button" onClick={handleGoogleAuth} disabled={loading} className={styles.google}>Continue with Google</button>
          <div className={styles.divider}>or continue with email</div>
          <form onSubmit={handleEmailAuth} className={styles.form}>
            {error && <div role="alert" className={styles.error}>{error}</div>}
            <div><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></div>
            <button type="submit" disabled={loading} className={styles.submit}>{loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}



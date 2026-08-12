"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      setError(err.message || "Authentication failed");
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
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="relative flex w-full max-w-4xl overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-cyan-900/10">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900/50 rounded-full p-1 backdrop-blur-md"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-zinc-900 via-cyan-950/20 to-zinc-950 p-12 md:flex border-r border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50"></div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-zinc-100 relative z-10">
            Real-time alerts for jobs from 3,000+ companies.
          </h2>
          <div className="mt-8 relative z-10">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-500 font-mono">Join 10,000+ developers.</p>
          </div>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-12 bg-zinc-950">
          <div className="mb-8 flex space-x-6 border-b border-zinc-800">
            <button
              className={`pb-3 text-sm font-medium transition-all duration-300 relative ${
                !isSignUp ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setIsSignUp(false)}
            >
              Sign in
              {!isSignUp && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full shadow-[0_-2px_10px_rgba(34,211,238,0.5)]" />
              )}
            </button>
            <button
              className={`pb-3 text-sm font-medium transition-all duration-300 relative ${
                isSignUp ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setIsSignUp(true)}
            >
              Sign up
              {isSignUp && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full shadow-[0_-2px_10px_rgba(34,211,238,0.5)]" />
              )}
            </button>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mb-6 flex w-full items-center justify-center space-x-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-300 transition-all hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 text-sm font-medium"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mb-6 flex items-center justify-center space-x-4">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">or email</span>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                placeholder="developer@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-cyan-950 transition-all hover:bg-cyan-400 disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Gift, UserPlus, Check } from "lucide-react";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://jobping.com?ref=jp_usr_9a8b7c6d";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans p-8 md:p-12 text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-10">
        <div className="border-b border-zinc-800 pb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Referral Program</h1>
          <p className="text-zinc-400 mt-2 text-sm font-mono">Invite your friends and get rewarded when they upgrade.</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-800/30 transition-all duration-700"></div>
          
          <div className="flex items-start gap-5 mb-8 relative z-10">
            <div className="p-4 bg-cyan-950/50 text-cyan-400 rounded-xl border border-cyan-900/50 shadow-inner">
              <Gift size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Your Referral Link</h2>
              <p className="text-zinc-400 text-sm mt-1 font-mono">Share this link to give your friends 1 free month.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="flex-1 bg-zinc-950/80 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.05)] ${
                copied 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                  : "bg-zinc-100 hover:bg-white text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:text-cyan-950"
              }`}
            >
              {!copied && <div className="absolute inset-0 bg-cyan-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>}
              
              <span className="relative z-10 flex items-center gap-2">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy Link"}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-sm">
          <div className="flex items-start gap-5 mb-8">
            <div className="p-4 bg-zinc-800/50 text-zinc-400 rounded-xl border border-zinc-700/50 shadow-inner">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Apply a Code</h2>
              <p className="text-zinc-400 text-sm mt-1 font-mono">Did someone refer you? Enter their code here.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="e.g. jp_usr_..." 
              className="flex-1 bg-zinc-950/80 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            <button className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 px-8 py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

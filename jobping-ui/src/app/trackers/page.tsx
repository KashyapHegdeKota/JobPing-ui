import { Plus, Tag } from "lucide-react";

export default function TrackersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans p-8 md:p-12 text-zinc-100">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Trackers</h1>
            <p className="text-zinc-400 mt-2 text-sm font-mono">Manage your job application trackers.</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2 w-40">
              <div className="flex justify-between text-xs text-zinc-400 font-medium uppercase tracking-wider font-mono">
                <span>Usage</span>
                <span className="text-cyan-400">36/50</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                <div 
                  className="bg-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] relative" 
                  style={{ width: '72%' }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-[1px]"></div>
                </div>
              </div>
            </div>
            <button className="group relative flex items-center gap-2 bg-zinc-100 text-zinc-900 px-5 py-2.5 rounded-lg font-semibold transition-all hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:text-cyan-950 overflow-hidden text-sm">
              <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus size={18} className="relative z-10" />
              <span className="relative z-10">New Tracker</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-cyan-900/10 hover:border-zinc-700 transition-all flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:via-cyan-400/50 group-hover:to-cyan-500/20 transition-all duration-500"></div>
              <h2 className="text-xl font-bold mb-4 tracking-tight text-zinc-100 group-hover:text-cyan-50 transition-colors">Software Engineer Track {i}</h2>
              <div className="flex flex-wrap gap-2 mb-8 flex-1">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-full font-medium">
                  <Tag size={12} className="text-cyan-500" /> Internship
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-full font-medium">
                  <Tag size={12} className="text-indigo-400" /> Remote
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-full font-medium">
                  <Tag size={12} className="text-emerald-400" /> Startup
                </span>
              </div>
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-500">
                <span>Updated 2h ago</span>
                <button className="text-cyan-500 hover:text-cyan-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View <span className="text-lg leading-none">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

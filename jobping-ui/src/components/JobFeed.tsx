import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import FilterBar from './FilterBar';

export default function JobFeed({ jobs, isConnected }: { jobs: Job[], isConnected: boolean }) {
  const [query, setQuery] = useState('');
  return (
    <div className="flex-1 bg-zinc-950 flex flex-col h-full font-sans relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800 p-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Live Feed</h2>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-cyan-400' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
      </div>

      <FilterBar query={query} onQueryChange={(e) => setQuery(e.target.value)} />

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
              <Search className="h-10 w-10 text-zinc-600 relative z-10" />
            </div>
            <p className="font-mono text-sm">Listening for new opportunities...</p>
          </div>
        ) : (
          <AnimatePresence>
            {jobs.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} idx={idx} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

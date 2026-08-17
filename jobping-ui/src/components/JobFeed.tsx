import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import FilterBar, { type Category } from './FilterBar';

export function matchesCategory(job: Job, category: Category) {
  if (category === 'All') return true;
  const text = `${job.title} ${job.role_type ?? ''} ${job.experience_level ?? ''}`.toLowerCase();
  return category === 'Summer 2027' ? text.includes('summer 2027') : /new grad|new graduate|entry.?level/.test(text);
}

export function filterJobs(jobs: Job[], query: string, category: Category, remoteOnly: boolean): Job[] {
  const normalizedQuery = query.trim().toLowerCase();
  return jobs.filter((job) => (!normalizedQuery || `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(normalizedQuery))
    && matchesCategory(job, category)
    && (!remoteOnly || /remote/i.test(`${job.location} ${job.work_model ?? ''}`)));
}

export default function JobFeed({ jobs, isConnected }: { jobs: Job[], isConnected: boolean }) {
  const initialParams = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const initialQuery = initialParams.get('q') ?? '';
  const initialCategory = initialParams.get('category');
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>(initialCategory === 'Summer 2027' || initialCategory === 'New Grad' ? initialCategory : 'All');
  const [remoteOnly, setRemoteOnly] = useState(initialParams.get('remote') === 'true');

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query), 250); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (category !== 'All') params.set('category', category);
    if (remoteOnly) params.set('remote', 'true');
    window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`);
  }, [debouncedQuery, category, remoteOnly]);

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, debouncedQuery, category, remoteOnly);
  }, [jobs, debouncedQuery, category, remoteOnly]);
  const clearFilters = () => { setQuery(''); setDebouncedQuery(''); setCategory('All'); setRemoteOnly(false); };

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

      <FilterBar query={query} category={category} remoteOnly={remoteOnly} resultCount={filteredJobs.length} totalCount={jobs.length} onQueryChange={(e) => setQuery(e.target.value)} onCategoryChange={setCategory} onRemoteChange={setRemoteOnly} onClear={clearFilters} />

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
            {filteredJobs.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} idx={idx} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

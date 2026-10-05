import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import FilterBar, { type Category, type DateFilter } from './FilterBar';
import { useCompanies } from '../hooks/useCompanies';
import { trackActivity } from '../lib/analytics';
import styles from '../app/jobs-page.module.css';
import FeedOverview from './FeedOverview';

export function matchesCategory(job: Job, category: Category) {
  if (category === 'All') return true;
  const text = `${job.title} ${job.role_type ?? ''} ${job.experience_level ?? ''}`.toLowerCase();
  return category === 'Summer 2027' ? text.includes('summer 2027') : /new grad|new graduate|entry.?level/.test(text);
}

export function matchesDateFilter(job: Job, dateFilter: DateFilter, nowMs: number) {
  if (dateFilter === 'All Time') return true;
  const jobDateMs = new Date(job.posted_at || job.discovered_at).getTime();
  if (isNaN(jobDateMs)) return true;
  const diffMs = nowMs - jobDateMs;
  if (dateFilter === 'Past 24 hours') return diffMs <= 24 * 60 * 60 * 1000;
  if (dateFilter === 'Past Week') return diffMs <= 7 * 24 * 60 * 60 * 1000;
  if (dateFilter === 'Past Month') return diffMs <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

export function filterJobs(jobs: Job[], query: string, category: Category, remoteOnly: boolean, dateFilter: DateFilter = 'All Time', companyFilter: string = 'All', nowMs: number = Date.now()): Job[] {
  const normalizedQuery = query.trim().toLowerCase();
  return jobs.filter((job) => (!normalizedQuery || `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(normalizedQuery))
    && matchesCategory(job, category)
    && (!remoteOnly || /remote/i.test(`${job.location} ${job.work_model ?? ''}`))
    && matchesDateFilter(job, dateFilter, nowMs)
    && (companyFilter === 'All' || job.company === companyFilter));
}

export default function JobFeed({ jobs, isConnected, isLoading = false, isLoadingMore = false, error, hasMore = false, total, loadMore }: { jobs: Job[], isConnected: boolean, isLoading?: boolean, isLoadingMore?: boolean, error?: string | null, hasMore?: boolean, total?: number | null, loadMore?: () => void }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const companies = useCompanies();
  
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = feedRef.current;
    if (!sentinel || !root || !loadMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { root, rootMargin: '500px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);
  
  const initialParams = useSearchParams();
  const initialQuery = initialParams.get('q') ?? '';
  const initialCategory = initialParams.get('category');
  const initialDateFilter = initialParams.get('dateFilter') as DateFilter;
  const initialCompanyFilter = initialParams.get('companyFilter') || 'All';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>(initialCategory === 'Summer 2027' || initialCategory === 'New Grad' ? initialCategory : 'All');
  const [remoteOnly, setRemoteOnly] = useState(initialParams.get('remote') === 'true');
  const validDateFilters = ['All Time', 'Past 24 hours', 'Past Week', 'Past Month'];
  const [dateFilter, setDateFilter] = useState<DateFilter>(validDateFilters.includes(initialDateFilter) ? initialDateFilter : 'All Time');
  const [companyFilter, setCompanyFilter] = useState<string>(initialCompanyFilter);
  const previousFilters = useRef<string | null>(null);
  useEffect(() => {
    const filters = { category, remote_only: remoteOnly, date_filter: dateFilter,
      company: companyFilter === 'All' ? null : companyFilter, search_used: Boolean(debouncedQuery.trim()) };
    const signature = JSON.stringify(filters);
    if (previousFilters.current !== null && previousFilters.current !== signature) {
      void trackActivity('filter_change', '/', { filters });
    }
    previousFilters.current = signature;
  }, [category, remoteOnly, dateFilter, companyFilter, debouncedQuery]);

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query), 250); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (category !== 'All') params.set('category', category);
    if (remoteOnly) params.set('remote', 'true');
    if (dateFilter !== 'All Time') params.set('dateFilter', dateFilter);
    if (companyFilter !== 'All') params.set('companyFilter', companyFilter);
    window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`);
  }, [debouncedQuery, category, remoteOnly, dateFilter, companyFilter]);

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, debouncedQuery, category, remoteOnly, dateFilter, companyFilter);
  }, [jobs, debouncedQuery, category, remoteOnly, dateFilter, companyFilter]);
  const clearFilters = () => { setQuery(''); setDebouncedQuery(''); setCategory('All'); setRemoteOnly(false); setDateFilter('All Time'); setCompanyFilter('All'); };

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <div className="flex items-center gap-3">
          <div>
            <p className={styles.eyebrow}>Live opportunities</p>
            <h1 className={styles.title}>Be early. Get noticed.</h1>
            <p className={styles.subtitle}>Fresh internship and new-grad roles from the teams shaping what comes next.</p>
          </div>
        </div>
        <div className={styles.connection} role="status"><span className={`${styles.dot} ${!isConnected ? styles.dotOffline : ''}`} />{isConnected ? 'Live feed connected' : 'Reconnecting to live feed'}</div>
      </header>

      <FeedOverview total={total} loaded={jobs.length} loading={isLoading} />
      <FilterBar query={query} category={category} remoteOnly={remoteOnly} dateFilter={dateFilter} companyFilter={companyFilter} companies={companies} resultCount={filteredJobs.length} totalCount={total ?? jobs.length} onQueryChange={(e) => setQuery(e.target.value)} onCategoryChange={setCategory} onRemoteChange={setRemoteOnly} onDateFilterChange={setDateFilter} onCompanyFilterChange={setCompanyFilter} onClear={clearFilters} />

      {/* Feed */}
      <div ref={feedRef} className={styles.feed}>
        {jobs.length > 0 && filteredJobs.length === 0 ? (
          <div className={styles.empty}><Search className="h-9 w-9 text-[#9aa6b5]" /><p>No jobs match your filters.</p><button onClick={clearFilters}>Clear all filters</button></div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>
            <Search className="h-9 w-9 text-[#9aa6b5]" />
            <p>Listening for new opportunities...</p>
          </div>
        ) : (
          <div className={styles.cards}><AnimatePresence>{filteredJobs.map((job, idx) => <JobCard key={job.id || idx} job={job} />)}</AnimatePresence></div>
        )}
        {error && <div role="alert" className={styles.error}><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Reload jobs</button></div>}
        {isLoadingMore && <p className={styles.footerText}>Loading more jobs…</p>}
        {!isLoading && !isLoadingMore && !error && hasMore && <div ref={sentinelRef} className="h-2 shrink-0" aria-hidden="true" />}
        {!isLoading && !isLoadingMore && !hasMore && jobs.length > 0 && <p className={styles.footerText}>You’ve reached the end of the feed.</p>}
      </div>
    </div>
  );
}


"use client";

import React, { Suspense } from 'react';
import Filters from '../components/Filters';
import JobFeed from '../components/JobFeed';
import { useLiveJobs } from '../hooks/useLiveJobs';
import styles from './jobs-page.module.css';

export default function Home() {
  return <Suspense fallback={<p role="status" className="p-6 text-zinc-400">Loading jobs…</p>}><LiveFeed /></Suspense>;
}

function LiveFeed() {
  const { jobs, isConnected, isLoading, isLoadingMore, error, total, hasMore, loadMore } = useLiveJobs();

  return (
    <div className={`${styles.shell} flex h-screen w-full font-sans`}>
      <div className="flex h-full w-full overflow-hidden">
        <Filters />
        <JobFeed jobs={jobs} isConnected={isConnected} isLoading={isLoading} isLoadingMore={isLoadingMore} error={error} total={total} hasMore={hasMore} loadMore={loadMore} />
      </div>
      
      {!isConnected && (
        <div className="fixed bottom-6 right-6 z-20 flex items-center gap-3 rounded-lg border border-[#e5caca] bg-[#fff7f7] px-5 py-3 text-sm font-medium text-[#b74c4c] shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d97878] opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c05a59]"></span>
          </span>
          Reconnecting to live feed...
        </div>
      )}
    </div>
  );
}

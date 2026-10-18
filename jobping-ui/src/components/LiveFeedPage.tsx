"use client";

import React, { Suspense, useState } from 'react';
import Filters from './Filters';
import JobFeed from './JobFeed';
import { useLiveJobs } from '../hooks/useLiveJobs';
import styles from '../app/jobs-page.module.css';
import ScreenedFeed from './ScreenedFeed';
import { screeningEnabled } from '../lib/screening';
import screeningStyles from './screening.module.css';

export default function LiveFeedPage() {
  const [screened, setScreened] = useState(true);
  return (
    <Suspense fallback={<p role="status" className="p-6 text-zinc-400">Loading jobs…</p>}>
      <div className={styles.pageWrapper}>
        {screeningEnabled() && (
          <div className={screeningStyles.modeBar}>
            <nav aria-label="Job feed mode" className={`${screeningStyles.actions} ${screeningStyles.modeSwitch}`}>
              <button type="button" aria-pressed={screened} onClick={() => setScreened(true)}>My screened roles</button>
              <button type="button" aria-pressed={!screened} onClick={() => setScreened(false)}>All roles</button>
            </nav>
          </div>
        )}
        {screeningEnabled() && screened ? <ScreenedFeed /> : <LiveFeed />}
      </div>
    </Suspense>
  );
}

function LiveFeed() {
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const { jobs, isConnected, isLoading, isLoadingMore, error, total, hasMore, loadMore, retry } = useLiveJobs(discoveryQuery);

  return (
    <div className={`${styles.shell} flex w-full font-sans`}>
      <div className={styles.workspaceBody}>
        <JobFeed jobs={jobs} isConnected={isConnected} isLoading={isLoading} isLoadingMore={isLoadingMore} error={error} total={total} hasMore={hasMore} loadMore={loadMore} retry={retry} onDiscoveryQueryChange={setDiscoveryQuery} />
        <Filters />
      </div>

      {!isConnected && (
        <div className={styles.reconnectToast}>
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



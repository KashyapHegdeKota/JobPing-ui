"use client";

import React from 'react';
import Filters from '../components/Filters';
import JobFeed from '../components/JobFeed';
import { useLiveJobs } from '../hooks/useLiveJobs';

export default function Home() {
  const { jobs, isConnected } = useLiveJobs();

  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans">
      <div className="flex w-full h-full mx-auto overflow-hidden bg-zinc-950">
        <Filters />
        <JobFeed jobs={jobs} isConnected={isConnected} />
      </div>
      
      {!isConnected && (
        <div className="fixed bottom-6 right-6 bg-red-950/80 border border-red-900/50 text-red-400 px-5 py-3 rounded-lg shadow-xl shadow-black/50 text-sm font-medium backdrop-blur-md flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          Reconnecting to live feed...
        </div>
      )}
    </div>
  );
}

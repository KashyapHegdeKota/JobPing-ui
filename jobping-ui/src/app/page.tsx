"use client";

import React from 'react';
import Filters from '../components/Filters';
import JobFeed from '../components/JobFeed';
import { useLiveJobs } from '../hooks/useLiveJobs';

export default function Home() {
  const { jobs, isConnected } = useLiveJobs();

  return (
    <div className="flex h-screen w-full bg-zinc-100 font-mono">
      <div className="flex w-full h-full mx-auto overflow-hidden bg-white shadow-sm border-x border-gray-200">
        <Filters />
        <JobFeed jobs={jobs} />
      </div>
      
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-sm text-sm">
          Connecting to live feed...
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Search } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';

export default function JobFeed({ jobs }: { jobs: Job[] }) {
  return (
    <div className="flex-1 bg-white flex flex-col h-full font-mono">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">All jobs (filters)</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-500 py-8 text-center">Waiting for live jobs...</div>
        ) : (
          jobs.map((job, idx) => (
            <div key={job.id || idx} className="flex items-center justify-between border border-gray-200 rounded p-3 hover:border-red-300 hover:shadow-sm transition-all bg-white">
              <div className="flex items-center gap-6">
                <div className="font-semibold text-sm text-gray-900 w-48 truncate" title={job.title}>
                  {job.title}
                </div>
                <div className="text-sm text-gray-600 w-32 truncate" title={job.company}>
                  {job.company}
                </div>
                <div className="text-sm text-gray-500 w-32 truncate">
                  {job.location}
                </div>
                <div className="text-xs text-gray-400">
                  Listed 5m ago
                </div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded transition-colors font-semibold">
                Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

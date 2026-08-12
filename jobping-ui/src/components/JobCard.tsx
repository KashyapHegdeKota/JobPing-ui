import React from 'react';
import { MapPin, Building2, Clock } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';
import { motion } from 'framer-motion';

export default function JobCard({ job, idx }: { job: Job, idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="group relative flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 bg-zinc-900/50 rounded-xl p-5 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-sm hover:shadow-xl hover:shadow-cyan-900/5 overflow-hidden shrink-0"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/0 group-hover:bg-cyan-500/100 transition-colors duration-300"></div>
      
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-lg text-zinc-100 tracking-tight">
          {job.title}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <span className="font-medium text-zinc-300">{job.company}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>{job.posted_at ? 'recently' : 'just now'}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center justify-end">
        <button className="relative bg-zinc-100 text-zinc-900 text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:bg-white overflow-hidden group/btn shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:text-cyan-950">
          <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">Apply Now</span>
        </button>
      </div>
    </motion.div>
  );
}

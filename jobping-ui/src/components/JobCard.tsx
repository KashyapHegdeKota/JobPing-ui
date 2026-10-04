import React from 'react';
import { MapPin, Building2, Clock } from 'lucide-react';
import { Job } from '../hooks/useLiveJobs';
import { motion } from 'framer-motion';

import { formatJobDate } from '../lib/jobDates';
import { trackActivity } from '../lib/analytics';
import styles from '../app/jobs-page.module.css';

export default function JobCard({ job }: { job: Job }) {
  const dateText = formatJobDate(job);
  const absoluteDate = job.posted_at 
    ? new Date(job.posted_at).toLocaleString() 
    : (job.discovered_at ? new Date(job.discovered_at).toLocaleString() : 'Unknown date');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={styles.card}
    >
      <div className={styles.cardMain}>
        <div className={styles.cardTitle}>
          {job.title}
        </div>
        
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Building2 className="h-3.5 w-3.5" />
            <span>{job.company}</span>
          </div>
          <div className={styles.metaItem}>
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location}</span>
          </div>
          <div className={`${styles.metaItem} ${styles.time}`}>
            <Clock className="h-3.5 w-3.5" />
            <time title={absoluteDate} dateTime={job.posted_at || job.discovered_at || undefined}>
              {dateText}
            </time>
          </div>
        </div>
      </div>
      
      <div>
        {job.apply_url && (
          <a
            href={job.apply_url}
            onClick={() => {
              const jobId = Number(job.id);
              if (Number.isSafeInteger(jobId) && jobId > 0) void trackActivity('job_click', '/', { job_id: jobId });
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.apply}
          >
            Apply Now
          </a>
        )}
      </div>
    </motion.div>
  );
}

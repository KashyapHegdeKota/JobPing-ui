"use client";

import { Bookmark, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Job } from "../hooks/useLiveJobs";
import { useSavedJob } from "../hooks/useSavedJob";
import { formatJobCardDate } from "../lib/jobDates";
import { trackActivity } from "../lib/analytics";
import styles from "./JobCard.module.css";
import JobEvidence from './JobEvidence';

export default function JobCard({ job }: { job: Job }) {
  const { saved, toggle, error } = useSavedJob(job.id);
  const dateText = formatJobCardDate(job);
  const timestamp = job.posted_at || job.discovered_at;
  const validDate = timestamp && !Number.isNaN(new Date(timestamp).getTime());
  const absoluteDate = validDate ? new Date(timestamp).toLocaleString() : "Unknown date";
  const type = job.role_type?.trim().toLowerCase().replace(/_/g, " ");
  const internship = type === "internship";
  const roleLabel = internship ? "Internship" : type === "new grad" ? "New grad" : job.role_type?.replace(/_/g, " ") || "Role type not listed";
  const location = job.location?.trim() || "Location not listed";
  const workModel = job.work_model?.trim();
  const locationText = workModel && !location.toLowerCase().includes(workModel.toLowerCase()) ? `${location} · ${workModel}` : location;
  const initial = Array.from(job.company.trim())[0]?.toUpperCase() || "?";
  const avatarTone = [styles.lavender, styles.peach, styles.mint][(initial.codePointAt(0) ?? 0) % 3];

  return <motion.article initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className={styles.card} aria-label={job.title}>
    <div className={styles.header}>
      <span className={`${styles.avatar} ${avatarTone}`} aria-hidden="true">{initial}</span>
      <div className={styles.identity}><p className={styles.company}>{job.company}</p><h2 className={styles.title}>{job.title}</h2></div>
      <button type="button" className={styles.bookmark} aria-label={`${saved ? "Unsave" : "Save"} ${job.title} on this device`} aria-pressed={saved} title={saved ? "Saved on this device" : "Save on this device"} onClick={toggle}><Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button>
    </div>
    <div className={styles.details}>
      <span className={`${styles.role} ${internship ? styles.internship : ""}`}>{roleLabel}</span>
      <span className={styles.location}>{locationText}</span>
    </div>
    <div className={styles.footer}>
      <span className={styles.date}><Clock size={14} aria-hidden="true" /><time title={absoluteDate} dateTime={validDate ? timestamp : undefined}>{dateText}</time></span>
      {job.is_closed && <span className={styles.closed}>Applications closed</span>}
      {!job.is_closed && job.apply_url && <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className={styles.view} aria-label={`View role: ${job.title} at ${job.company}`} onClick={() => {
        const jobId = Number(job.id);
        if (Number.isSafeInteger(jobId) && jobId > 0) void trackActivity("job_click", "/", { job_id: jobId });
      }}>View role <ExternalLink size={15} aria-hidden="true" /></a>}
    </div>
    <JobEvidence job={job} />
    {error && <p role="status" className={styles.error}>{error}</p>}
  </motion.article>;
}

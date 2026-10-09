// The API historically stores date-only source values at UTC midnight. Treat
// these conservatively as calendar dates, including older persisted records.
// Even a true midnight post loses only display precision; no time is invented.
export function isDayOnlyPostingDate(timestamp?: string): boolean {
  return Boolean(timestamp
    && /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.0+)?(?:Z|\+00:00))?$/.test(timestamp)
    && Number.isFinite(Date.parse(timestamp)));
}

export function formatJobCardDate(job: { posted_at?: string; discovered_at?: string }, nowMs: number = Date.now()): string {
  const timestamp = job.posted_at || job.discovered_at;
  const age = timestamp ? nowMs - new Date(timestamp).getTime() : NaN;
  const label = job.posted_at ? "Posted" : "Discovered";
  if (!isDayOnlyPostingDate(job.posted_at) && Number.isFinite(age) && age >= 0 && age < 24 * 60 * 60 * 1000) {
    if (age < 60_000) return `${label} just now`;
    if (age < 60 * 60 * 1000) return `${label} ${Math.floor(age / 60_000)} min ago`;
    const hours = Math.floor(age / (60 * 60 * 1000));
    return `${label} ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  return formatJobDate(job, nowMs);
}

export function formatJobDate(
  job: { posted_at?: string; discovered_at?: string },
  nowMs: number = Date.now()
): string {
  if (job.posted_at) {
    const postedMs = new Date(job.posted_at).getTime();
    if (isNaN(postedMs)) return 'Date unavailable';

    const nowDate = new Date(nowMs);
    const postedDate = new Date(postedMs);
    
    const dayOnly = isDayOnlyPostingDate(job.posted_at);
    const startOfNow = dayOnly
      ? Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate())
      : Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const startOfPosted = dayOnly
      ? Date.UTC(postedDate.getUTCFullYear(), postedDate.getUTCMonth(), postedDate.getUTCDate())
      : Date.UTC(postedDate.getFullYear(), postedDate.getMonth(), postedDate.getDate());
    
    const calDiffDays = Math.floor((startOfNow - startOfPosted) / (1000 * 60 * 60 * 24));
    const days = Math.max(0, calDiffDays);

    if (days === 0) {
      return 'Posted today';
    } else if (days === 1) {
      return 'Posted yesterday';
    } else if (days < 30) {
      return `Posted ${days} days ago`;
    } else {
      const months = Math.floor(days / 30);
      return `Posted about ${months} month${months === 1 ? '' : 's'} ago`;
    }
  } else if (job.discovered_at) {
    const discMs = new Date(job.discovered_at).getTime();
    if (isNaN(discMs)) return 'Date unavailable';
    const diffMs = Math.max(0, nowMs - discMs);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return `Discovered ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  return 'Date unavailable';
}

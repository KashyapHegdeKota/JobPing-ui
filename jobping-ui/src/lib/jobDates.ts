export function formatJobDate(
  job: { posted_at?: string; discovered_at?: string },
  nowMs: number = Date.now()
): string {
  if (job.posted_at) {
    const postedMs = new Date(job.posted_at).getTime();
    if (isNaN(postedMs)) return 'Date unavailable';

    const nowDate = new Date(nowMs);
    const postedDate = new Date(postedMs);
    
    const startOfNow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
    const startOfPosted = new Date(postedDate.getFullYear(), postedDate.getMonth(), postedDate.getDate()).getTime();
    
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

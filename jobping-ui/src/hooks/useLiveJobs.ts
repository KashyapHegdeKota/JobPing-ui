import { useState, useEffect, useCallback, useRef } from 'react';

export interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  posted_at: string; // ISO format or timestamp
  apply_url?: string;
  work_model?: string;
  role_type?: string;
  experience_level?: string;
}
interface ApiJob {
  id: number;
  title: string;
  company: { name: string };
  location: string;
  created_at: string;
  apply_url: string;
  job_type: string;
}

interface PaginatedJobsResponse {
  items: ApiJob[];
  total?: number;
  page?: number;
  page_size?: number;
}

interface LiveJobEvent {
  occurred_at?: string;
  job?: {
    id?: number;
    title?: string;
    company?: string;
    company_id?: number;
    location?: string;
    apply_url?: string;
    job_type?: string;
  };
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const WEBSOCKET_URL = API_URL.replace(/^http/, 'ws');

function mergeUnique(primary: Job[], secondary: Job[]): Job[] {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((job) => {
    const id = String(job.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function fromApiJob(job: ApiJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    location: job.location,
    posted_at: job.created_at,
    apply_url: job.apply_url,
    role_type: job.job_type,
  };
}

function fromLiveEvent(value: unknown): Job | null {
  if (typeof value !== 'object' || value === null) return null;
  const event = value as LiveJobEvent;
  const job = event.job;
  if (!job?.id || !job.title || !job.location) return null;
  return {
    id: job.id,
    title: job.title,
    company: job.company ?? (job.company_id ? `Company #${job.company_id}` : 'Unknown company'),
    location: job.location,
    posted_at: event.occurred_at ?? new Date().toISOString(),
    apply_url: job.apply_url,
    role_type: job.job_type,
  };
}

export function useLiveJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const loadMoreInFlightRef = useRef(false);
  const pageSize = 50;

  const loadPage = useCallback(async (nextPage: number, signal?: AbortSignal) => {
    const response = await fetch(`${API_URL}/api/v1/jobs?page=${nextPage}&page_size=${pageSize}`, { signal });
    if (!response.ok) throw new Error(`Job API returned HTTP ${response.status}`);
    const payload = (await response.json()) as PaginatedJobsResponse;
    const nextJobs = Array.isArray(payload.items) ? payload.items.map(fromApiJob) : [];
    setJobs((current) => mergeUnique(current, nextJobs));
    if (typeof payload.total === 'number') setTotal(payload.total);
    const reportedSize = payload.page_size || pageSize;
    hasMoreRef.current = typeof payload.total === 'number'
      ? nextPage * reportedSize < payload.total
      : nextJobs.length === reportedSize;
    setHasMore(hasMoreRef.current);
    pageRef.current = nextPage;
    setPage(nextPage);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const initialLoad = window.setTimeout(() => {
      void loadPage(1, abortController.signal)
        .then(() => setError(null))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          console.error('Failed to fetch existing jobs', error);
          setError(error instanceof Error ? error.message : 'Failed to load jobs');
        })
        .finally(() => {
          if (!abortController.signal.aborted) setIsLoading(false);
        });
    }, 0);

    const ws = new WebSocket(`${WEBSOCKET_URL}/api/v1/ws/live`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const newJob = fromLiveEvent(JSON.parse(event.data));
        if (newJob) setJobs((prevJobs) => mergeUnique([newJob], prevJobs));
      } catch (error) {
        console.error('Failed to parse job data', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      abortController.abort();
      window.clearTimeout(initialLoad);
      ws.close();
    };
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || loadMoreInFlightRef.current || !hasMoreRef.current) return;
    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    try {
      await loadPage(pageRef.current + 1);
      setError(null);
    } catch (loadError: unknown) {
      console.error('Failed to fetch more jobs', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load more jobs');
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, loadPage]);

  return { jobs, isConnected, isLoading, isLoadingMore, error, total, page, hasMore, loadMore };
}

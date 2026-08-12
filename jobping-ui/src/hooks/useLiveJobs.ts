import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const abortController = new AbortController();
    void fetch(`${API_URL}/api/v1/jobs?page=1&page_size=50`, {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Job API returned HTTP ${response.status}`);
        return (await response.json()) as PaginatedJobsResponse;
      })
      .then((response) => {
        const existingJobs = Array.isArray(response.items) ? response.items.map(fromApiJob) : [];
        // Preserve any WebSocket events received while the initial request was in flight.
        setJobs((liveJobs) => mergeUnique(liveJobs, existingJobs));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to fetch existing jobs', error);
      });

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
      ws.close();
    };
  }, []);

  return { jobs, isConnected };
}

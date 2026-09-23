import { useState, useEffect, useCallback, useRef } from 'react';

export interface Job {
  id: string | number;
  title: string;
  company: string;
  company_id?: number;
  location: string;
  posted_at?: string;
  discovered_at: string;
  updated_at?: string;
  apply_url?: string;
  work_model?: string;
  role_type?: string;
  experience_level?: string;
  season?: number;
  content_hash?: string;
  is_closed: boolean;
}

interface ApiJob {
  id: number;
  company_id: number;
  title: string;
  company: { name: string };
  location: string;
  season: number;
  job_type: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  posted_at?: string | null;
  apply_url: string;
}

interface PaginatedJobsResponse {
  items: ApiJob[];
  total?: number;
  page?: number;
  page_size?: number;
}

interface LiveJobPayload {
  id: number;
  title: string;
  location: string;
  company?: string | { name?: string };
  company_id?: number;
  apply_url?: string;
  season?: number;
  job_type?: string;
  is_closed: boolean;
  content_hash?: string;
  posted_at?: string;
}

interface LiveJobEvent {
  version: 1;
  type: 'JOB_CREATED' | 'JOB_UPDATED';
  occurred_at: string;
  job: LiveJobPayload;
}

interface JobRecord {
  job: Job;
  lastUpdateSequence: number;
}

type JobSource =
  | { type: 'http'; requestUpdateSequence: number }
  | { type: 'live' | 'reconcile'; sequence: number };

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const WEBSOCKET_URL = API_URL.replace(/^http/, 'ws');
const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000];
const PAGE_SIZE = 50;

function isOlderTimestamp(incoming?: string, existing?: string): boolean {
  if (!incoming || !existing) return false;
  const incomingTime = Date.parse(incoming);
  const existingTime = Date.parse(existing);
  return Number.isFinite(incomingTime) && Number.isFinite(existingTime) && incomingTime < existingTime;
}

function isCompanyFallback(company: string): boolean {
  return !company.trim()
    || /^unknown(?: company)?$/i.test(company.trim())
    || /^company #\d+$/i.test(company.trim());
}

function mergeJob(existing: Job | undefined, incoming: Job, preserveMutableFields: boolean, source: JobSource['type']): Job {
  if (!existing) return incoming;

  const mergeValue = <T,>(oldValue: T | undefined, newValue: T | undefined): T | undefined => {
    if (preserveMutableFields || newValue === undefined) return oldValue;
    return newValue;
  };

  let company = existing.company;
  if (isCompanyFallback(incoming.company)) {
    if (isCompanyFallback(existing.company) && incoming.company.trim()) company = incoming.company;
  } else if (isCompanyFallback(existing.company) || !preserveMutableFields) {
    company = incoming.company;
  }

  return {
    id: incoming.id,
    title: mergeValue(existing.title, incoming.title) ?? existing.title,
    company,
    company_id: mergeValue(existing.company_id, incoming.company_id),
    location: mergeValue(existing.location, incoming.location) ?? existing.location,
    posted_at: mergeValue(existing.posted_at, incoming.posted_at),
    // The HTTP representation has the actual creation time; a live event only
    // has its occurrence time, which is a useful placeholder for new jobs.
    discovered_at: source === 'http' ? incoming.discovered_at : existing.discovered_at,
    updated_at: mergeValue(existing.updated_at, incoming.updated_at),
    apply_url: mergeValue(existing.apply_url, incoming.apply_url),
    work_model: mergeValue(existing.work_model, incoming.work_model),
    role_type: mergeValue(existing.role_type, incoming.role_type),
    experience_level: mergeValue(existing.experience_level, incoming.experience_level),
    season: mergeValue(existing.season, incoming.season),
    content_hash: mergeValue(existing.content_hash, incoming.content_hash),
    is_closed: mergeValue(existing.is_closed, incoming.is_closed) ?? existing.is_closed,
  };
}

function fromApiJob(job: ApiJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.name || (job.company_id ? `Company #${job.company_id}` : 'Unknown company'),
    company_id: job.company_id,
    location: job.location,
    season: job.season,
    role_type: job.job_type,
    is_closed: job.is_closed === true,
    posted_at: job.posted_at ?? undefined,
    discovered_at: job.created_at,
    updated_at: job.updated_at,
    apply_url: job.apply_url,
  };
}

function fromLiveEvent(value: unknown): Job | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;

  const event = value as Partial<LiveJobEvent>;
  if (
    event.version !== 1
    || (event.type !== 'JOB_CREATED' && event.type !== 'JOB_UPDATED')
    || typeof event.occurred_at !== 'string'
    || !Number.isFinite(Date.parse(event.occurred_at))
    || typeof event.job !== 'object'
    || event.job === null
  ) return null;

  const job = event.job as Partial<LiveJobPayload>;
  if (
    typeof job.id !== 'number'
    || !Number.isSafeInteger(job.id)
    || job.id <= 0
    || typeof job.title !== 'string'
    || !job.title.trim()
    || typeof job.location !== 'string'
    || !job.location.trim()
    || typeof job.is_closed !== 'boolean'
  ) return null;

  const optionalTextValues = [job.apply_url, job.job_type, job.content_hash, job.posted_at];
  if (optionalTextValues.some((item) => item !== undefined && typeof item !== 'string')) return null;
  if (job.company_id !== undefined && (!Number.isSafeInteger(job.company_id) || job.company_id <= 0)) return null;
  if (job.season !== undefined && (typeof job.season !== 'number' || !Number.isFinite(job.season))) return null;
  if (job.company !== undefined && job.company !== null && typeof job.company !== 'string') {
    if (typeof job.company !== 'object' || Array.isArray(job.company) || typeof job.company.name !== 'string') return null;
  }

  const eventCompany = typeof job.company === 'string'
    ? job.company
    : job.company?.name;

  return {
    id: job.id,
    title: job.title,
    company: eventCompany || (job.company_id ? `Company #${job.company_id}` : 'Unknown company'),
    company_id: job.company_id,
    location: job.location,
    posted_at: job.posted_at,
    discovered_at: event.occurred_at,
    updated_at: event.occurred_at,
    apply_url: job.apply_url,
    role_type: job.job_type,
    season: job.season,
    content_hash: job.content_hash,
    is_closed: job.is_closed,
  };
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
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
  const mountedRef = useRef(false);
  const jobUpdateSequenceRef = useRef(0);
  const jobRecordsRef = useRef(new Map<string, JobRecord>());
  const jobOrderRef = useRef<string[]>([]);

  const applyJobs = useCallback((incomingJobs: Job[], source: JobSource) => {
    if (!mountedRef.current) return;

    for (const incoming of incomingJobs) {
      const key = String(incoming.id);
      const record = jobRecordsRef.current.get(key);
      const previous = record?.job;
      const olderTimestamp = isOlderTimestamp(incoming.updated_at, previous?.updated_at);
      const eventIsNewerThanRequest = source.type === 'http'
        && record !== undefined
        && record.lastUpdateSequence > source.requestUpdateSequence;
      const preserveMutableFields = olderTimestamp || eventIsNewerThanRequest;
      const merged = mergeJob(previous, incoming, preserveMutableFields, source.type === 'http' ? 'http' : 'live');
      const lastUpdateSequence = (source.type === 'live' || source.type === 'reconcile') && !olderTimestamp
        ? source.sequence
        : record?.lastUpdateSequence ?? 0;

      jobRecordsRef.current.set(key, { job: merged, lastUpdateSequence });

      if (merged.is_closed) {
        jobOrderRef.current = jobOrderRef.current.filter((jobId) => jobId !== key);
      } else if (!previous || previous.is_closed) {
        const remaining = jobOrderRef.current.filter((jobId) => jobId !== key);
        jobOrderRef.current = source.type === 'live' ? [key, ...remaining] : [...remaining, key];
      } else if (!jobOrderRef.current.includes(key)) {
        jobOrderRef.current = [...jobOrderRef.current, key];
      }
    }

    setJobs(jobOrderRef.current.flatMap((key) => {
      const job = jobRecordsRef.current.get(key)?.job;
      return job && !job.is_closed ? [job] : [];
    }));
  }, []);

  const loadPage = useCallback(async (
    nextPage: number,
    options: { signal?: AbortSignal; updatePagination?: boolean; reconcileActivePage?: boolean } = {},
  ) => {
    const requestUpdateSequence = jobUpdateSequenceRef.current;
    const visibleIdsAtRequest = options.reconcileActivePage ? [...jobOrderRef.current] : [];
    const query = new URLSearchParams({
      page: String(nextPage),
      page_size: String(PAGE_SIZE),
      active: 'true',
    });
    const response = await fetch(`${API_URL}/api/v1/jobs?${query.toString()}`, { signal: options.signal });
    if (!response.ok) throw new Error(`Job API returned HTTP ${response.status}`);
    const payload = (await response.json()) as PaginatedJobsResponse;
    if (!mountedRef.current || options.signal?.aborted) return;

    const nextJobs = Array.isArray(payload.items) ? payload.items.map(fromApiJob) : [];
    const reportedSize = payload.page_size || PAGE_SIZE;
    const nextHasMore = typeof payload.total === 'number'
      ? (options.updatePagination === false ? pageRef.current : nextPage) * reportedSize < payload.total
      : nextJobs.length === reportedSize;
    applyJobs(nextJobs, { type: 'http', requestUpdateSequence });
    if (typeof payload.total === 'number') setTotal(payload.total);
    if (options.reconcileActivePage && nextPage === 1 && typeof payload.total === 'number' && payload.total <= reportedSize) {
      const activeIds = new Set(nextJobs.map((job) => String(job.id)));
      for (const key of visibleIdsAtRequest) {
        const record = jobRecordsRef.current.get(key);
        if (!record || record.job.is_closed || activeIds.has(key) || record.lastUpdateSequence > requestUpdateSequence) continue;
        const sequence = jobUpdateSequenceRef.current + 1;
        jobUpdateSequenceRef.current = sequence;
        applyJobs([{ ...record.job, is_closed: true }], { type: 'reconcile', sequence });
      }
    }
    if (options.reconcileActivePage && nextPage === 1) {
      const pageIds = [...new Set(nextJobs.flatMap((job) => {
        const key = String(job.id);
        const current = jobRecordsRef.current.get(key)?.job;
        return current && !current.is_closed ? [key] : [];
      }))];
      const pageIdSet = new Set(pageIds);
      const eventUpdates = jobOrderRef.current.filter((key) => {
        const record = jobRecordsRef.current.get(key);
        return !pageIdSet.has(key) && record !== undefined && !record.job.is_closed
          && record.lastUpdateSequence > requestUpdateSequence;
      });
      const remainingJobs = jobOrderRef.current.filter((key) => !pageIdSet.has(key) && !eventUpdates.includes(key));
      jobOrderRef.current = [...eventUpdates, ...pageIds, ...remainingJobs];
      setJobs(jobOrderRef.current.flatMap((key) => {
        const job = jobRecordsRef.current.get(key)?.job;
        return job && !job.is_closed ? [job] : [];
      }));
    }
    hasMoreRef.current = nextHasMore;
    setHasMore(nextHasMore);
    if (options.updatePagination !== false) {
      pageRef.current = nextPage;
      setPage(nextPage);
    }
  }, [applyJobs]);

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let retryAttempt = 0;
    let shouldRefreshAfterConnect = false;
    const requestControllers = new Set<AbortController>();
    mountedRef.current = true;

    const requestPage = (nextPage: number, updatePagination = false, isInitialLoad = false, reconcileActivePage = false) => {
      const controller = new AbortController();
      requestControllers.add(controller);
      void loadPage(nextPage, { signal: controller.signal, updatePagination, reconcileActivePage })
        .then(() => {
          if (!disposed) setError(null);
        })
        .catch((loadError: unknown) => {
          if (disposed || isAbortError(loadError)) return;
          console.error('Failed to fetch existing jobs', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load jobs');
        })
        .finally(() => {
          requestControllers.delete(controller);
          if (!disposed && isInitialLoad) setIsLoading(false);
        });
    };

    function scheduleReconnect() {
      if (disposed || reconnectTimer !== null) return;
      const delay = RECONNECT_DELAYS_MS[Math.min(retryAttempt, RECONNECT_DELAYS_MS.length - 1)];
      retryAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    }

    function connect() {
      if (disposed || socket !== null) return;

      let nextSocket: WebSocket;
      try {
        nextSocket = new WebSocket(`${WEBSOCKET_URL}/api/v1/ws/live`);
      } catch {
        shouldRefreshAfterConnect = true;
        scheduleReconnect();
        return;
      }

      socket = nextSocket;
      nextSocket.onopen = () => {
        if (disposed || socket !== nextSocket) return;
        setIsConnected(true);
        retryAttempt = 0;
        if (shouldRefreshAfterConnect) {
          shouldRefreshAfterConnect = false;
          requestPage(1, false, false, true);
        }
      };

      nextSocket.onmessage = (message) => {
        if (disposed || socket !== nextSocket || typeof message.data !== 'string') return;
        let value: unknown;
        try {
          value = JSON.parse(message.data);
        } catch {
          return;
        }

        const liveJob = fromLiveEvent(value);
        if (!liveJob) return;
        const sequence = jobUpdateSequenceRef.current + 1;
        jobUpdateSequenceRef.current = sequence;
        applyJobs([liveJob], { type: 'live', sequence });
      };

      nextSocket.onerror = () => {
        if (disposed || socket !== nextSocket) return;
        shouldRefreshAfterConnect = true;
        nextSocket.close();
      };

      nextSocket.onclose = () => {
        if (socket === nextSocket) socket = null;
        if (disposed) return;
        shouldRefreshAfterConnect = true;
        setIsConnected(false);
        scheduleReconnect();
      };
    }

    const initialLoadTimer = window.setTimeout(() => requestPage(1, true, true), 0);
    connect();

    return () => {
      disposed = true;
      mountedRef.current = false;
      window.clearTimeout(initialLoadTimer);
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      for (const controller of requestControllers) controller.abort();
      requestControllers.clear();
      const currentSocket = socket;
      socket = null;
      currentSocket?.close();
    };
  }, [applyJobs, loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || loadMoreInFlightRef.current || !hasMoreRef.current) return;
    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    try {
      await loadPage(pageRef.current + 1, { updatePagination: true });
      if (mountedRef.current) setError(null);
    } catch (loadError: unknown) {
      if (!mountedRef.current || isAbortError(loadError)) return;
      console.error('Failed to fetch more jobs', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load more jobs');
    } finally {
      loadMoreInFlightRef.current = false;
      if (mountedRef.current) setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, loadPage]);

  return { jobs, isConnected, isLoading, isLoadingMore, error, total, page, hasMore, loadMore };
}

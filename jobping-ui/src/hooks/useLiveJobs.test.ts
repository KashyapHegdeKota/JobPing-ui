import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLiveJobs } from './useLiveJobs';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  readonly url: string;
  readyState = 0;
  closeCalls = 0;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  open() {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }

  sendMessage(data: string) {
    this.onmessage?.({ data });
  }

  disconnect() {
    this.readyState = 3;
    this.onclose?.(new CloseEvent('close'));
  }

  close() {
    this.closeCalls += 1;
    this.readyState = 3;
  }
}

const apiJob = (id: number, values: Record<string, unknown> = {}) => ({
  id,
  company_id: 7,
  title: `Job ${id}`,
  company: { name: 'Acme' },
  location: 'Remote',
  season: 2027,
  job_type: 'internship',
  is_closed: false,
  created_at: '2027-01-01T12:00:00Z',
  updated_at: '2027-01-01T12:00:00Z',
  posted_at: '2027-01-01T10:00:00Z',
  apply_url: `https://example.com/jobs/${id}`,
  ...values,
});

const jobEvent = (
  id: number,
  values: Record<string, unknown> = {},
  type: 'JOB_CREATED' | 'JOB_UPDATED' = 'JOB_UPDATED',
  occurredAt = '2027-01-02T12:00:00Z',
) => ({
  version: 1,
  type,
  occurred_at: occurredAt,
  job: {
    id,
    company_id: 7,
    title: `Job ${id}`,
    location: 'Remote',
    season: 2027,
    job_type: 'internship',
    apply_url: `https://example.com/jobs/${id}`,
    is_closed: false,
    content_hash: `hash-${id}`,
    ...values,
  },
});

const response = (items: unknown[], total = items.length, pageSize = 50) => new Response(
  JSON.stringify({ items, total, page_size: pageSize }),
  { status: 200 },
);

async function advanceTimersBy(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useLiveJobs live feed', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('requests only active jobs and filters a closed row from the response', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      void url;
      return response([apiJob(1), apiJob(2, { is_closed: true })], 2);
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.searchParams.get('active')).toBe('true');
    expect(result.current.jobs.map((job) => job.id)).toEqual([1]);
  });

  it('loads later pages, merges duplicate IDs, and stops at the API total', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const page = new URL(url).searchParams.get('page');
      return page === '1'
        ? response([apiJob(1), apiJob(2)], 3, 2)
        : response([apiJob(2), apiJob(3)], 3, 2);
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());

    await waitFor(() => expect(result.current.jobs).toHaveLength(2));
    await act(async () => { await result.current.loadMore(); });

    expect(result.current.jobs.map((job) => job.id)).toEqual([1, 2, 3]);
    expect(result.current.total).toBe(3);
    expect(result.current.hasMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.every(([url]) => new URL(url).searchParams.get('active') === 'true')).toBe(true);
  });

  it('does not issue duplicate requests while a page is in flight', async () => {
    let resolvePage!: (page: Response) => void;
    const nextPage = new Promise<Response>((resolve) => { resolvePage = resolve; });
    const fetchMock = vi.fn((url: string) => new URL(url).searchParams.get('page') === '1'
      ? Promise.resolve(response([apiJob(1)], 2, 1))
      : nextPage);
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    let firstRequest!: Promise<void>;
    act(() => {
      firstRequest = result.current.loadMore();
      void result.current.loadMore();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolvePage(response([apiJob(2)], 2, 1));
    await act(async () => { await firstRequest; });
  });

  it('maps HTTP creation and posting dates', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([apiJob(1)], 1, 1)));
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    expect(result.current.jobs[0].posted_at).toBe('2027-01-01T10:00:00Z');
    expect(result.current.jobs[0].discovered_at).toBe('2027-01-01T12:00:00Z');
  });

  it('keeps a known company name when a later event has only company_id', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([apiJob(42, { company: { name: 'Datadog' } })], 1, 1)));
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.open();
      socket.sendMessage(JSON.stringify(jobEvent(42, { location: 'New York' }, 'JOB_UPDATED', '2027-01-03T12:00:00Z')));
    });

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].company).toBe('Datadog');
    expect(result.current.jobs[0].location).toBe('New York');
  });

  it('lets HTTP enrich a WebSocket-first placeholder without losing newer event fields', async () => {
    let resolveInitial!: (page: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveInitial = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.open();
      socket.sendMessage(JSON.stringify(jobEvent(42, {
        title: 'Software Engineer',
        location: 'New York',
        apply_url: 'https://example.com/new-role',
      }, 'JOB_CREATED', '2027-01-03T12:00:00Z')));
    });
    expect(result.current.jobs[0].company).toBe('Company #7');

    resolveInitial(response([apiJob(42, {
      title: 'Software Engineer',
      company: { name: 'Datadog' },
      location: 'Remote',
      apply_url: 'https://example.com/old-role',
      updated_at: '2027-01-02T12:00:00Z',
    })], 1, 1));
    await waitFor(() => expect(result.current.jobs[0].company).toBe('Datadog'));

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].location).toBe('New York');
    expect(result.current.jobs[0].apply_url).toBe('https://example.com/new-role');
  });

  it('applies a newer WebSocket update when HTTP loaded first', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([apiJob(42, { company: { name: 'Datadog' } })], 1, 1)));
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.open();
      socket.sendMessage(JSON.stringify(jobEvent(42, {
        location: 'Seattle',
        apply_url: 'https://example.com/reposted-role',
      }, 'JOB_UPDATED', '2027-01-03T12:00:00Z')));
    });

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].company).toBe('Datadog');
    expect(result.current.jobs[0].location).toBe('Seattle');
    expect(result.current.jobs[0].apply_url).toBe('https://example.com/reposted-role');
  });

  it('removes a closed job and allows the same ID to reappear once when reopened', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([apiJob(42, { company: { name: 'Datadog' } })], 1, 1)));
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const socket = FakeWebSocket.instances[0];
    act(() => socket.open());

    act(() => {
      socket.sendMessage(JSON.stringify(jobEvent(42, { is_closed: true }, 'JOB_UPDATED', '2027-01-03T12:00:00Z')));
    });
    expect(result.current.jobs).toEqual([]);

    const reopened = jobEvent(42, {
      is_closed: false,
      apply_url: 'https://example.com/reposted-role',
    }, 'JOB_UPDATED', '2027-01-04T12:00:00Z');
    act(() => {
      socket.sendMessage(JSON.stringify(reopened));
      socket.sendMessage(JSON.stringify(reopened));
    });

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].id).toBe(42);
    expect(result.current.jobs[0].company).toBe('Datadog');
    expect(result.current.jobs[0].apply_url).toBe('https://example.com/reposted-role');
  });

  it('adds duplicate create events only once', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { result } = renderHook(() => useLiveJobs());
    const socket = FakeWebSocket.instances[0];
    const created = JSON.stringify(jobEvent(99, {}, 'JOB_CREATED'));

    act(() => {
      socket.sendMessage(created);
      socket.sendMessage(created);
    });

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].id).toBe(99);
  });

  it('ignores malformed, pong, and unknown messages without changing the feed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([apiJob(1)], 1, 1)));
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.sendMessage('{not JSON');
      socket.sendMessage(JSON.stringify({ type: 'pong' }));
      socket.sendMessage(JSON.stringify({ version: 1, type: 'FUTURE_EVENT', job: apiJob(2) }));
      socket.sendMessage(JSON.stringify({ version: 1, type: 'JOB_UPDATED', job: { id: 2 } }));
      socket.sendMessage(JSON.stringify(jobEvent(1, { apply_url: 42 })));
    });

    expect(result.current.jobs.map((job) => job.id)).toEqual([1]);
  });

  it('reconnects after an unexpected close and refreshes active jobs', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((url: string) => {
      void url;
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    const firstSocket = FakeWebSocket.instances[0];
    act(() => firstSocket.open());
    await advanceTimersBy(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => firstSocket.disconnect());
    expect(result.current.isConnected).toBe(false);
    await advanceTimersBy(999);
    expect(FakeWebSocket.instances).toHaveLength(1);
    await advanceTimersBy(1);
    expect(FakeWebSocket.instances).toHaveLength(2);

    act(() => FakeWebSocket.instances[1].open());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const refreshUrl = new URL(fetchMock.mock.calls[1][0] as string);
    expect(refreshUrl.searchParams.get('page')).toBe('1');
    expect(refreshUrl.searchParams.get('active')).toBe('true');
  });

  it('removes stale page-one jobs after reconnect when the refreshed active page is complete', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([apiJob(42)], 1, 50))
      .mockResolvedValueOnce(response([], 0, 50));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await advanceTimersBy(0);
    await flushPromises();
    expect(result.current.jobs).toHaveLength(1);
    const firstSocket = FakeWebSocket.instances[0];
    act(() => firstSocket.open());
    act(() => firstSocket.disconnect());
    await advanceTimersBy(1_000);
    act(() => FakeWebSocket.instances[1].open());
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.jobs).toEqual([]);
  });

  it('keeps pagination on the loaded page during a reconnect refresh', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async (url: string) => {
      const requestedPage = new URL(url).searchParams.get('page');
      const offset = requestedPage === '2' ? 50 : 0;
      return response(Array.from({ length: 50 }, (_, index) => apiJob(offset + index + 1)), 100, 50);
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await advanceTimersBy(0);
    await flushPromises();
    expect(result.current.jobs).toHaveLength(50);
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.page).toBe(2);
    expect(result.current.hasMore).toBe(false);

    const firstSocket = FakeWebSocket.instances[0];
    act(() => {
      firstSocket.open();
      firstSocket.disconnect();
    });
    await advanceTimersBy(1_000);
    act(() => FakeWebSocket.instances[1].open());
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.current.page).toBe(2);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.jobs).toHaveLength(100);
    expect(result.current.jobs.some((job) => job.id === 51)).toBe(true);
  });

  it('uses bounded backoff and resets to the first delay after reconnect succeeds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    renderHook(() => useLiveJobs());
    const firstSocket = FakeWebSocket.instances[0];

    act(() => firstSocket.disconnect());
    await advanceTimersBy(1_000);
    const secondSocket = FakeWebSocket.instances[1];
    expect(FakeWebSocket.instances).toHaveLength(2);

    act(() => secondSocket.disconnect());
    await advanceTimersBy(1_999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    await advanceTimersBy(1);
    const thirdSocket = FakeWebSocket.instances[2];
    expect(FakeWebSocket.instances).toHaveLength(3);

    act(() => {
      thirdSocket.open();
      thirdSocket.disconnect();
    });
    await advanceTimersBy(999);
    expect(FakeWebSocket.instances).toHaveLength(3);
    await advanceTimersBy(1);
    expect(FakeWebSocket.instances).toHaveLength(4);
  });

  it('clears pending reconnects on unmount', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { unmount } = renderHook(() => useLiveJobs());
    const socket = FakeWebSocket.instances[0];
    act(() => socket.disconnect());

    unmount();
    await advanceTimersBy(30_000);

    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('closes an active socket on unmount', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { unmount } = renderHook(() => useLiveJobs());
    const socket = FakeWebSocket.instances[0];

    unmount();

    expect(socket.closeCalls).toBe(1);
  });
});

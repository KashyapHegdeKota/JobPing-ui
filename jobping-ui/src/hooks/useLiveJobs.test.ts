import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLiveJobs } from './useLiveJobs';

class FakeWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  close() { this.onclose?.(); }
}

const apiJob = (id: number) => ({ id, title: `Job ${id}`, company: { name: 'Acme' }, location: 'Remote', created_at: '2027-01-01T12:00:00Z', posted_at: '2027-01-01T10:00:00Z', apply_url: 'https://example.com', job_type: 'Internship' });

describe('useLiveJobs pagination and mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  it('loads the next page, deduplicates jobs, and stops at the API total', async () => {
    const fetchMock = vi.fn((url: string) => {
      const page = new URL(url).searchParams.get('page');
      const payload = page === '1' ? { items: [apiJob(1), apiJob(2)], total: 3, page_size: 2 } : { items: [apiJob(2), apiJob(3)], total: 3, page_size: 2 };
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(2));
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.jobs.map((job) => job.id)).toEqual([1, 2, 3]);
    expect(result.current.total).toBe(3);
    expect(result.current.hasMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { await result.current.loadMore(); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not issue duplicate requests while a page is in flight', async () => {
    let resolvePage!: (response: Response) => void;
    const nextPage = new Promise<Response>((resolve) => { resolvePage = resolve; });
    const fetchMock = vi.fn((url: string) => url.includes('page=1')
      ? Promise.resolve(new Response(JSON.stringify({ items: [apiJob(1)], total: 2, page_size: 1 })))
      : nextPage);
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    let first!: Promise<void>;
    act(() => { first = result.current.loadMore(); void result.current.loadMore(); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolvePage(new Response(JSON.stringify({ items: [apiJob(2)], total: 2, page_size: 1 })));
    await act(async () => { await first; });
  });
  it('maps dates from API correctly', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ items: [apiJob(1)], total: 1, page_size: 1 }), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const job = result.current.jobs[0];
    expect(job.posted_at).toBe('2027-01-01T10:00:00Z');
    expect(job.discovered_at).toBe('2027-01-01T12:00:00Z');
  });

  it('maps dates from WebSocket live event correctly', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    let socket!: FakeWebSocket;
    vi.stubGlobal('WebSocket', function() {
      socket = new FakeWebSocket();
      return socket;
    });
    const { result } = renderHook(() => useLiveJobs());
    await waitFor(() => { if (!socket) throw new Error(); });
    
    act(() => {
      socket.onopen?.();
      socket.onmessage?.({
        data: JSON.stringify({
          occurred_at: '2027-01-01T12:05:00Z',
          job: { id: 99, title: 'WS Job', location: 'Remote', company: 'Acme', posted_at: '2027-01-01T10:05:00Z' }
        })
      });
    });
    
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    const job = result.current.jobs[0];
    expect(job.posted_at).toBe('2027-01-01T10:05:00Z');
    expect(job.discovered_at).toBe('2027-01-01T12:05:00Z');
  });
});

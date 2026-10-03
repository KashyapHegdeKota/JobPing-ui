import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import JobFeed from './JobFeed';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('companyFilter=Microsoft&q=Engineer&dateFilter=Past+Week&remote=true'),
}));
vi.mock('../hooks/useCompanies', () => ({ useCompanies: () => ['Microsoft'] }));
vi.mock('../lib/analytics', () => ({ trackActivity: vi.fn() }));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('hydrates a filtered URL with the same filters rendered on the server', async () => {
  const browserWindow = window;
  let markup: string;
  vi.stubGlobal('window', undefined);
  try {
    markup = renderToString(<JobFeed jobs={[]} isConnected={false} />);
  } finally {
    vi.stubGlobal('window', browserWindow);
  }
  expect(markup).toContain('Microsoft');
  expect(markup).toContain('value="Engineer"');
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.append(container);
  const recoverable = vi.fn();
  const originalUrl = window.location.href;
  window.history.replaceState({}, '', '/?companyFilter=Microsoft&q=Engineer&dateFilter=Past+Week&remote=true');
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <JobFeed jobs={[]} isConnected={false} />, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('[aria-label="Search jobs"]')?.value).toBe('Engineer');
    expect(container.querySelector('select')?.value).toBe('Past Week');
    expect(container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true);
    expect(new URLSearchParams(window.location.search).get('companyFilter')).toBe('Microsoft');
  } finally {
    await act(async () => root?.unmount());
    container.remove();
    window.history.replaceState({}, '', originalUrl);
  }
});

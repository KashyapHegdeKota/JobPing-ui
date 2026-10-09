import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JobCard from './JobCard';

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock('../lib/analytics', () => ({ trackActivity: analytics.track }));
const example = { id: 12, title: 'Software Engineer, New Grad', company: 'Linear', location: 'San Francisco, CA', role_type: 'new_grad', discovered_at: '2026-10-04T12:00:00Z', apply_url: 'https://example.com/apply', is_closed: false };
beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); });

describe('JobCard', () => {
  it('shows the reference details and preserves the external job-click contract', () => {
    render(<JobCard job={{ ...example, work_model: 'Hybrid' }} />);
    expect(screen.getByRole('heading')).toHaveTextContent(example.title);
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('New grad')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA · Hybrid')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: `View role: ${example.title} at Linear` });
    expect(link).toHaveAttribute('href', example.apply_url);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
    expect(analytics.track).toHaveBeenCalledWith('job_click', '/', { job_id: 12 });
    expect(screen.queryByText(/salary/i)).not.toBeInTheDocument();
  });
  it('shows internship type and does not repeat an existing work arrangement', () => {
    render(<JobCard job={{ ...example, role_type: 'internship', location: 'Austin, TX · Hybrid', work_model: 'Hybrid', apply_url: undefined }} />);
    expect(screen.getByText('Internship')).toBeInTheDocument();
    expect(screen.getByText('Austin, TX · Hybrid')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('persists bookmarks locally and synchronizes duplicate cards', () => {
    const view = render(<><JobCard job={example} /><JobCard job={example} /></>);
    fireEvent.click(screen.getAllByRole('button', { name: /Save Software Engineer/ })[0]);
    expect(screen.getAllByRole('button', { name: /Unsave Software Engineer/ })).toHaveLength(2);
    expect(window.localStorage.getItem('jobping:saved-job:12')).toBe('1');
    view.unmount();
    render(<JobCard job={example} />);
    const button = screen.getByRole('button', { name: /Unsave Software Engineer/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(window.localStorage.getItem('jobping:saved-job:12')).toBeNull();
    expect(screen.getByRole('button', { name: /Save Software Engineer/ })).toHaveAttribute('aria-pressed', 'false');
  });
  it('reports storage failure without claiming a saved bookmark', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage denied'); });
    render(<JobCard job={example} />);
    fireEvent.click(screen.getByRole('button', { name: /Save Software Engineer/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Saving is unavailable');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
  it('renders a semantic <time> element with the relative date text and absolute date title', () => {
    const job = {
      id: 1,
      title: 'Software Engineer',
      company: 'Acme',
      location: 'Remote',
      posted_at: '2026-05-15T12:00:00Z',
      discovered_at: '2026-05-15T12:00:00Z',
      is_closed: false,
    };

    // Inject fixed time into jobDates formatter logic by mocking Date.now
    const mockNow = new Date('2026-05-16T12:00:00Z').getTime();
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);

    const { container } = render(<JobCard job={job} />);
    
    const timeEl = container.querySelector('time');
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute('dateTime')).toBe('2026-05-15T12:00:00Z');
    
    // The relative time should be 'Posted yesterday'
    expect(timeEl?.textContent).toBe('Posted yesterday');
    
    // The title should contain the absolute localized date
    expect(timeEl?.getAttribute('title')).toBe(new Date('2026-05-15T12:00:00Z').toLocaleString());

    vi.restoreAllMocks();
  });

  it('renders a source calendar date without a fabricated posting time', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-09T22:32:00Z'));
    const { container } = render(<JobCard job={{ ...example, posted_at: '2026-10-09T00:00:00+00:00' }} />);
    const time = container.querySelector('time');
    expect(time).toHaveTextContent('Posted today');
    expect(time).toHaveAttribute('datetime', '2026-10-09');
    expect(time?.title).toContain('posting time unavailable');
    vi.restoreAllMocks();
  });

  it('does not show an apply action for a closed role', () => {
    const job = {
      id: 2,
      title: 'Closed Engineer',
      company: 'Acme',
      location: 'Remote',
      discovered_at: '2026-05-15T12:00:00Z',
      apply_url: 'https://example.com/apply',
      is_closed: true,
    };

    render(<JobCard job={job} />);
    expect(screen.queryByRole('link', { name: /View role/ })).not.toBeInTheDocument();
    expect(screen.getByText('Applications closed')).toBeInTheDocument();
  });
});

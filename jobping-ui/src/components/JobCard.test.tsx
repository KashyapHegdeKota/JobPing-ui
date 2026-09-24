import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import JobCard from './JobCard';

describe('JobCard', () => {
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

    const { queryByRole } = render(<JobCard job={job} />);
    expect(queryByRole('link', { name: 'Apply Now' })).toBeNull();
  });
});

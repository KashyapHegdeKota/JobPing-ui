import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import JobEvidence from './JobEvidence';
import type { Job } from '../hooks/useLiveJobs';

afterEach(cleanup);
const job: Job = { id: 1, title: 'Intern', company: 'Acme', location: 'US', discovered_at: '2026-10-08T12:00:00Z', is_closed: false };
const evidence = { source: 'greenhouse', source_url: 'https://example.com/jobs/1', excerpt: 'We cannot provide sponsorship.', observed_at: '2026-10-08T12:00:00Z' };

it('shows unknown fields explicitly without guessing international eligibility', () => {
  render(<JobEvidence job={job} />);
  expect(screen.getByText('Work authorization not stated')).toBeInTheDocument();
  expect(screen.getByText('Pay not listed')).toBeInTheDocument();
  expect(screen.getByText('CPT: Not stated')).toBeInTheDocument();
});

it('keeps negative role policy alongside separately dated employer history and pay', () => {
  render(<JobEvidence job={{ ...job, details: { policies: { sponsorship: { value: 'denied', evidence: [evidence] } }, compensation: [{ ...evidence, minimum: '35', maximum: '50', currency: 'USD', interval: 'hour', component: 'base', location: 'New York' }] }, immigration_records: [{ kind: 'h1b_filings', year: 2025, count: 10, employer_name: 'Acme LLC', source_url: 'https://www.dol.gov/data', observed_at: evidence.observed_at }] }} />);
  expect(screen.getAllByText('Sponsorship: Not accepted')).toHaveLength(2);
  expect(screen.getByText('H-1B history · employer')).toBeInTheDocument();
  expect(screen.getByText('H-1B certified filings · 2025')).toBeInTheDocument();
  expect(screen.getAllByText(evidence.excerpt)).toHaveLength(2);
  expect(screen.getByRole('link', { name: 'Official source' })).toHaveAttribute('href', 'https://www.dol.gov/data');
  expect(screen.getAllByText(/USD.*hour base pay/)).toHaveLength(2);
});

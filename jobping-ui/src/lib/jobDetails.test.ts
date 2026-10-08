import { describe, expect, it } from 'vitest';
import { discoveryQuery, emptyDiscoveryFilters, formatPay, matchesDiscovery, readDiscoveryFilters, safeEvidenceUrl, type CompensationRange } from './jobDetails';

const pay: CompensationRange = { source: 'lever', source_url: 'https://jobs.lever.co/acme/1', excerpt: 'USD 40–50 per hour', observed_at: '2026-10-08T12:00:00Z', minimum: '40', maximum: '50', currency: 'USD', interval: 'hour', component: 'base', location: 'New York, NY' };

describe('discovery evidence contracts', () => {
  it('does not infer OPT acceptance from employer H-1B history', () => {
    const job = { immigration_records: [{ kind: 'h1b_filings' as const, year: 2025, count: 3, employer_name: 'Acme LLC', source_url: 'https://www.dol.gov/data', observed_at: '2026-10-08T12:00:00Z' }] };
    expect(matchesDiscovery(job, { ...emptyDiscoveryFilters, policy: 'opt' })).toBe(false);
    expect(matchesDiscovery(job, { ...emptyDiscoveryFilters, h1bHistory: true })).toBe(true);
  });
  it('filters pay by currency, period and advertised lower bound', () => {
    const job = { details: { policies: {}, compensation: [pay] } };
    expect(matchesDiscovery(job, { ...emptyDiscoveryFilters, minimumPay: '35', currency: 'USD', interval: 'hour' })).toBe(true);
    expect(matchesDiscovery(job, { ...emptyDiscoveryFilters, minimumPay: '35', currency: 'USD', interval: 'year' })).toBe(false);
    expect(matchesDiscovery(job, { ...emptyDiscoveryFilters, minimumPay: '45', currency: 'USD', interval: 'hour' })).toBe(false);
  });
  it('roundtrips filters and rejects invalid URL settings', () => {
    const filters = { ...emptyDiscoveryFilters, policy: 'cpt' as const, h1bHistory: true, salaryReported: true, minimumPay: '30', interval: 'hour' };
    expect(readDiscoveryFilters(new URLSearchParams(discoveryQuery(filters)))).toEqual(filters);
    expect(readDiscoveryFilters(new URLSearchParams('policy=guaranteed&minimum_pay=-1&pay_currency=$&pay_interval=decade'))).toEqual(emptyDiscoveryFilters);
  });
  it('displays original pay units and bounded evidence links', () => {
    expect(formatPay(pay)).toBe('USD 40.00–USD 50.00/hour base pay');
    expect(formatPay({ ...pay, interval: 'unknown' })).toContain('period not stated');
    expect(safeEvidenceUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeEvidenceUrl('https://secret@example.com')).toBeUndefined();
  });
});

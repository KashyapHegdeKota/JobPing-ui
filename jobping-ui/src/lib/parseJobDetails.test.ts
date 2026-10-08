import { expect, it } from 'vitest';
import { parseEmployerRecords, parseJobDetails } from './parseJobDetails';

it('rejects malformed nested live fields and unsafe evidence links', () => {
  expect(parseJobDetails('invalid')).toBeUndefined();
  expect(parseJobDetails(null)).toBeNull();
  expect(parseJobDetails({ policies: { opt: { value: 'allowed', evidence: 'invalid' } }, compensation: [{ currency: 'invalid' }] })).toEqual({ policies: {}, compensation: [] });
});

it('retains only dated records from the corresponding official source', () => {
  const record = { kind: 'h1b_filings', year: 2025, count: 2, employer_name: 'Acme LLC', observed_at: '2026-10-08T00:00:00Z' };
  expect(parseEmployerRecords([{ ...record, source_url: 'https://www.dol.gov/data' }, { ...record, source_url: 'https://dol.gov.impostor.com/data' }])).toHaveLength(1);
});

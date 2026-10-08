import { policyNames, safeEvidenceUrl, type Evidence, type JobDetails, type EmployerRecord, type CompensationRange, type PolicyFact, type PolicyKind } from './jobDetails';

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function evidence(value: unknown): value is Evidence {
  return object(value) && typeof value.source === 'string' && typeof value.excerpt === 'string'
    && typeof value.source_url === 'string' && !!safeEvidenceUrl(value.source_url)
    && typeof value.observed_at === 'string' && Number.isFinite(Date.parse(value.observed_at));
}

function amount(value: unknown): boolean {
  return value === null || ((typeof value === 'string' && value.trim() !== '') || typeof value === 'number')
    && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100000000;
}

export function parseJobDetails(value: unknown): JobDetails | null | undefined {
  if (value === null || value === undefined) return value;
  if (!object(value) || !object(value.policies) || !Array.isArray(value.compensation)) return undefined;
  const policies: Partial<Record<PolicyKind, PolicyFact>> = {};
  for (const [key, fact] of Object.entries(value.policies)) {
    if (!Object.hasOwn(policyNames, key) || !object(fact) || typeof fact.value !== 'string'
      || !['allowed', 'denied', 'conditional', 'conflicting', 'unknown'].includes(fact.value)
      || !Array.isArray(fact.evidence) || !fact.evidence.every(evidence)) continue;
    policies[key as PolicyKind] = fact as unknown as PolicyFact;
  }
  const compensation = value.compensation.slice(0, 20).filter((pay): pay is CompensationRange =>
    evidence(pay) && object(pay) && amount(pay.minimum) && amount(pay.maximum)
    && (pay.minimum !== null || pay.maximum !== null)
    && (pay.minimum === null || pay.maximum === null || Number(pay.minimum) <= Number(pay.maximum))
    && typeof pay.currency === 'string' && /^[A-Z]{3}$/.test(pay.currency)
    && typeof pay.interval === 'string' && ['hour', 'week', 'month', 'year', 'unknown'].includes(pay.interval)
    && typeof pay.component === 'string' && ['base', 'total', 'unspecified'].includes(pay.component)
    && (pay.location === null || typeof pay.location === 'string'));
  return { policies, compensation };
}

export function parseEmployerRecords(value: unknown): EmployerRecord[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((record): record is EmployerRecord => {
    if (!object(record) || typeof record.kind !== 'string' || typeof record.employer_name !== 'string'
      || typeof record.source_url !== 'string' || !safeEvidenceUrl(record.source_url)
      || typeof record.observed_at !== 'string' || !Number.isFinite(Date.parse(record.observed_at))
      || !Number.isInteger(record.year) || Number(record.year) < 2000 || Number(record.year) > 2100
      || !Number.isInteger(record.count) || Number(record.count) <= 0) return false;
    const domains: Record<string, string> = { h1b_filings: 'dol.gov', h1b_approvals: 'uscis.gov', cpt_history: 'ice.gov', opt_history: 'ice.gov', stem_opt_history: 'ice.gov', e_verify: 'e-verify.gov' };
    const host = domains[record.kind];
    const url = new URL(record.source_url);
    return !!host && url.protocol === 'https:' && (url.hostname === host || url.hostname.endsWith(`.${host}`));
  });
}

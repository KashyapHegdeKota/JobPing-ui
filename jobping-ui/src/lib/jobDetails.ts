export type PolicyValue = 'allowed' | 'denied' | 'conditional' | 'conflicting' | 'unknown';
export type PolicyKind = 'cpt' | 'opt' | 'stem_opt' | 'sponsorship' | 'future_sponsorship';
export interface Evidence { source: string; source_url: string; excerpt: string; observed_at: string }
export interface PolicyFact { value: PolicyValue; evidence: Evidence[] }
export interface CompensationRange extends Evidence { minimum: string | number | null; maximum: string | number | null; currency: string; interval: 'hour' | 'week' | 'month' | 'year' | 'unknown'; location: string | null; component: 'base' | 'total' | 'unspecified' }
export interface JobDetails { policies: Partial<Record<PolicyKind, PolicyFact>>; compensation: CompensationRange[] }
export interface EmployerRecord { kind: 'h1b_filings' | 'h1b_approvals' | 'cpt_history' | 'opt_history' | 'stem_opt_history' | 'e_verify'; year: number; count: number; employer_name: string; source_url: string; observed_at: string }
export interface DiscoveryFilters { policy: PolicyKind | ''; h1bHistory: boolean; salaryReported: boolean; minimumPay: string; currency: string; interval: string }
export const emptyDiscoveryFilters: DiscoveryFilters = { policy: '', h1bHistory: false, salaryReported: false, minimumPay: '', currency: 'USD', interval: 'year' };
export const policyNames: Record<PolicyKind, string> = { cpt: 'CPT', opt: 'OPT', stem_opt: 'STEM OPT', sponsorship: 'Sponsorship', future_sponsorship: 'Future sponsorship' };

export function discoveryQuery(filters: DiscoveryFilters): string {
  const params = new URLSearchParams();
  if (filters.policy) params.set('policy', filters.policy);
  if (filters.h1bHistory) params.set('h1b_history', 'true');
  if (filters.salaryReported) params.set('salary_reported', 'true');
  if (filters.minimumPay && Number.isFinite(Number(filters.minimumPay)) && Number(filters.minimumPay) >= 0 && Number(filters.minimumPay) <= 100000000) {
    params.set('minimum_pay', filters.minimumPay); params.set('pay_currency', filters.currency); params.set('pay_interval', filters.interval);
  }
  return params.toString();
}

export function readDiscoveryFilters(params: URLSearchParams): DiscoveryFilters {
  const policy = params.get('policy') ?? '';
  const minimum = params.get('minimum_pay') ?? '';
  const currency = params.get('pay_currency') ?? 'USD';
  const interval = params.get('pay_interval') ?? 'year';
  return { policy: Object.hasOwn(policyNames, policy) ? policy as PolicyKind : '', h1bHistory: params.get('h1b_history') === 'true', salaryReported: params.get('salary_reported') === 'true', minimumPay: minimum && Number.isFinite(Number(minimum)) && Number(minimum) >= 0 && Number(minimum) <= 100000000 ? minimum : '', currency: /^[A-Z]{3}$/.test(currency) ? currency : 'USD', interval: ['hour', 'week', 'month', 'year'].includes(interval) ? interval : 'year' };
}

export const MIN_ACTIVE_H1B_YEAR = 2023;

export function isDeterministicH1bSponsor(
  job: { details?: JobDetails | null; immigration_records?: EmployerRecord[] },
  minYear: number = MIN_ACTIVE_H1B_YEAR,
): boolean {
  const spons = job.details?.policies.sponsorship?.value;
  const future = job.details?.policies.future_sponsorship?.value;
  if (spons && spons !== 'unknown' && spons !== 'allowed') return false;
  if (future && future !== 'unknown' && future !== 'allowed') return false;
  return Boolean(
    job.immigration_records?.some(
      record =>
        (record.kind === 'h1b_filings' || record.kind === 'h1b_approvals') &&
        record.year >= minYear &&
        record.count >= 1,
    ),
  );
}

export function matchesDiscovery(job: { details?: JobDetails | null; immigration_records?: EmployerRecord[] }, filters: DiscoveryFilters): boolean {
  if (filters.policy) {
    const explicit = job.details?.policies[filters.policy]?.value === 'allowed';
    const dolFallback = (filters.policy === 'sponsorship' || filters.policy === 'future_sponsorship') && isDeterministicH1bSponsor(job);
    if (!explicit && !dolFallback) return false;
  }
  if (filters.h1bHistory && !job.immigration_records?.some(record => record.kind === 'h1b_filings' || record.kind === 'h1b_approvals')) return false;
  if (filters.salaryReported && !job.details?.compensation.length) return false;
  if (filters.minimumPay && !job.details?.compensation.some(pay => pay.currency === filters.currency && pay.interval === filters.interval && pay.minimum !== null && Number(pay.minimum) >= Number(filters.minimumPay))) return false;
  return true;
}

export function formatPay(pay: CompensationRange): string {
  const format = (value: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: pay.currency, currencyDisplay: 'code', maximumFractionDigits: 2 }).format(Number(value));
  const amount = pay.minimum !== null && pay.maximum !== null ? `${format(pay.minimum)}–${format(pay.maximum)}` : pay.minimum !== null ? `From ${format(pay.minimum)}` : pay.maximum !== null ? `Up to ${format(pay.maximum)}` : 'Pay not listed';
  return `${amount}${pay.interval === 'unknown' ? ' · period not stated' : `/${pay.interval}`}${pay.component === 'base' ? ' base pay' : pay.component === 'total' ? ' total compensation' : ''}`;
}

export function safeEvidenceUrl(value: string): string | undefined {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}

export interface H1bHistorySummary {
  totalFilings: number;
  latestYear: number;
  earliestYear: number;
  yearsCount: number;
  headline: string;
  records: EmployerRecord[];
}

export function summarizeH1bHistory(records: EmployerRecord[] | undefined): H1bHistorySummary | null {
  if (!records?.length) return null;
  const filings = records.filter(record => record.kind === 'h1b_filings' && record.count > 0);
  const target = filings.length ? filings : records.filter(record => record.kind === 'h1b_approvals' && record.count > 0);
  if (!target.length) return null;
  const sorted = [...target].sort((a, b) => b.year - a.year || b.count - a.count || a.employer_name.localeCompare(b.employer_name));
  const totalFilings = sorted.reduce((sum, record) => sum + record.count, 0);
  const years = new Set(sorted.map(record => record.year));
  const latestYear = sorted[0].year;
  const earliestYear = sorted[sorted.length - 1].year;
  const noun = totalFilings === 1 ? 'petition' : 'petitions';
  return {
    totalFilings,
    latestYear,
    earliestYear,
    yearsCount: years.size,
    headline: `Filed ${totalFilings.toLocaleString('en-US')} H-1B ${noun}, last filed ${latestYear}`,
    records: sorted,
  };
}


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

export function matchesDiscovery(job: { details?: JobDetails | null; immigration_records?: EmployerRecord[] }, filters: DiscoveryFilters): boolean {
  if (filters.policy && job.details?.policies[filters.policy]?.value !== 'allowed') return false;
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

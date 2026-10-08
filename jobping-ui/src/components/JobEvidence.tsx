import type { Job } from '../hooks/useLiveJobs';
import { formatPay, policyNames, safeEvidenceUrl, type PolicyKind } from '../lib/jobDetails';
import styles from './JobCard.module.css';

const values = { allowed: 'Accepted', denied: 'Not accepted', conditional: 'Conditional', conflicting: 'Conflicting information', unknown: 'Not stated' };
const historyLabels = { h1b_filings: 'H-1B certified filings', h1b_approvals: 'H-1B approvals', cpt_history: 'CPT employment history', opt_history: 'OPT employment history', stem_opt_history: 'STEM OPT employment history', e_verify: 'E-Verify enrollment observed' };

export default function JobEvidence({ job }: { job: Job }) {
  const policies = Object.entries(job.details?.policies ?? {});
  const compensation = job.details?.compensation ?? [];
  const records = job.immigration_records ?? [];
  return <div className={styles.evidence}>
    <div className={styles.badges}>
      {policies.map(([key, fact]) => fact && <span key={key} className={fact.value === 'allowed' ? styles.accepted : styles.caution}>{policyNames[key as PolicyKind]}: {values[fact.value]}</span>)}
      {policies.length === 0 && <span className={styles.unknown}>Work authorization not stated</span>}
      {records.some(record => record.kind === 'h1b_filings' || record.kind === 'h1b_approvals') && <span className={styles.history}>H-1B history · employer</span>}
      {(['cpt_history', 'opt_history', 'stem_opt_history', 'e_verify'] as const).map(kind => records.some(record => record.kind === kind) && <span className={styles.history} key={kind}>{historyLabels[kind]} · employer</span>)}
    </div>
    {compensation.map((pay, index) => <p className={styles.pay} key={index}>{formatPay(pay)}{pay.location && <small> · {pay.location}</small>}</p>)}
    {!compensation.length && <p className={styles.unknown}>Pay not listed</p>}
    <details className={styles.evidenceDetails}>
      <summary>Eligibility & pay evidence</summary>
      <p>These labels describe employer statements and historical records. CPT requires school authorization; OPT requires appropriate work authorization. STEM OPT also requires an eligible E-Verify employer and a training plan. Employer history does not guarantee sponsorship for this role.</p>
      {(Object.entries(policyNames) as [PolicyKind, string][]).map(([key, name]) => {
        const fact = job.details?.policies[key];
        return <section key={key}><strong>{name}: {values[fact?.value ?? 'unknown']}</strong>{fact?.evidence.map((item, index) => <blockquote key={index}><p>{item.excerpt}</p><EvidenceLink url={item.source_url} label={item.source} /><span> · Checked {new Date(item.observed_at).toLocaleDateString()}</span></blockquote>)}</section>;
      })}
      {compensation.map((pay, index) => <section key={index}><strong>{formatPay(pay)}</strong><p>{pay.excerpt}</p><EvidenceLink url={pay.source_url} label="Employer posting" /></section>)}
      {records.map((record, index) => <section key={index}><strong>{historyLabels[record.kind]} · {record.year}</strong><p>{record.employer_name}: {record.count.toLocaleString()} {record.kind === 'e_verify' ? 'record' : 'reported records'}</p><EvidenceLink url={record.source_url} label="Official source" /></section>)}
      {!records.length && <p>Employer sponsorship history: unknown. No matched record is not evidence of no sponsorship.</p>}
    </details>
  </div>;
}

function EvidenceLink({ url, label }: { url: string; label: string }) {
  const href = safeEvidenceUrl(url);
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{label}</a> : <span>{label}</span>;
}

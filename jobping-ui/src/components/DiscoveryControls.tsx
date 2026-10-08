import { type DiscoveryFilters, policyNames, type PolicyKind } from '../lib/jobDetails';
import styles from './DiscoveryControls.module.css';

export default function DiscoveryControls({ value, onChange }: { value: DiscoveryFilters; onChange: (value: DiscoveryFilters) => void }) {
  const update = (next: Partial<DiscoveryFilters>) => onChange({ ...value, ...next });
  return <fieldset className={styles.controls}>
    <legend>International students & posted pay</legend>
    <label>Role policy <select aria-label="Role work authorization policy" value={value.policy} onChange={event => update({ policy: event.target.value as PolicyKind | '' })}>
      <option value="">All roles, including unknown</option>
      {Object.entries(policyNames).map(([key, name]) => <option key={key} value={key}>{name} explicitly accepted</option>)}
    </select></label>
    <label><input type="checkbox" checked={value.h1bHistory} onChange={event => update({ h1bHistory: event.target.checked })} /> Employer has H-1B history</label>
    <label><input type="checkbox" checked={value.salaryReported} onChange={event => update({ salaryReported: event.target.checked })} /> Posted pay available</label>
    <label>Minimum advertised pay <input aria-label="Minimum advertised pay" type="number" min="0" max="100000000" step="any" value={value.minimumPay} onChange={event => update({ minimumPay: event.target.value })} placeholder="Any" /></label>
    <label>Currency <select aria-label="Pay currency" value={value.currency} onChange={event => update({ currency: event.target.value })}>{['USD', 'CAD', 'EUR', 'GBP', 'INR', 'AUD'].map(item => <option key={item}>{item}</option>)}</select></label>
    <label>Pay period <select aria-label="Pay period" value={value.interval} onChange={event => update({ interval: event.target.value })}>{['hour', 'week', 'month', 'year'].map(item => <option key={item} value={item}>Per {item}</option>)}</select></label>
    <p>Employer history describes past activity. Each role may have different requirements. Hourly and yearly amounts are filtered separately.</p>
  </fieldset>;
}

import { Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import Combobox from './Combobox';
import styles from '../app/jobs-page.module.css';

export type Category = 'All' | 'Summer 2027' | 'New Grad';
export type DateFilter = 'All Time' | 'Past 24 hours' | 'Past Week' | 'Past Month';
export interface FilterBarProps { query: string; category: Category; remoteOnly: boolean; dateFilter: DateFilter; companyFilter: string; companies: string[]; resultCount: number; totalCount: number; onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void; onCategoryChange: (category: Category) => void; onRemoteChange: (value: boolean) => void; onDateFilterChange: (value: DateFilter) => void; onCompanyFilterChange: (value: string) => void; onClear: () => void; }

export default function FilterBar({ query, category, remoteOnly, dateFilter, companyFilter, companies, resultCount, totalCount, onQueryChange, onCategoryChange, onRemoteChange, onDateFilterChange, onCompanyFilterChange, onClear }: FilterBarProps) {
  return <div className={styles.toolbar}>
    <div className={styles.toolbarRow}>
      <div className={styles.search}><Search className={styles.searchIcon} size={16} /><input aria-label="Search jobs" value={query} onChange={onQueryChange} placeholder="Search title, company, or location..." /></div>
      {(['All', 'Summer 2027', 'New Grad'] as Category[]).map((item) => <button type="button" key={item} onClick={() => onCategoryChange(item)} className={`${styles.chip} ${category === item ? styles.chipActive : ''}`}>{item}</button>)}
      <select 
        value={dateFilter} 
        onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
        className={styles.select}
      >
        <option value="All Time">All Time</option>
        <option value="Past 24 hours">Past 24 hours</option>
        <option value="Past Week">Past Week</option>
        <option value="Past Month">Past Month</option>
      </select>
      <Combobox
        value={companyFilter}
        onChange={onCompanyFilterChange}
        options={companies}
        placeholder="All Companies"
      />
      <label className={styles.check}><input type="checkbox" aria-label="Remote Only" checked={remoteOnly} onChange={(e) => onRemoteChange(e.target.checked)} /> Remote Only</label>
      <button type="button" onClick={onClear} className={styles.clear}><X className="h-3.5 w-3.5 inline" /> Clear Filters</button>
    </div><div className={styles.count}>Showing <strong>{resultCount}</strong> of {totalCount} jobs</div>
  </div>;
}

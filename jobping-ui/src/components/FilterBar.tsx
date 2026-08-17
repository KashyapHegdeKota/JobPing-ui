import { Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

export type Category = 'All' | 'Summer 2027' | 'New Grad';
export interface FilterBarProps { query: string; category: Category; remoteOnly: boolean; resultCount: number; totalCount: number; onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void; onCategoryChange: (category: Category) => void; onRemoteChange: (value: boolean) => void; onClear: () => void; }

export default function FilterBar({ query, category, remoteOnly, resultCount, totalCount, onQueryChange, onCategoryChange, onRemoteChange, onClear }: FilterBarProps) {
  return <div className="border-b border-zinc-800 px-6 py-4 space-y-3 bg-zinc-950/70">
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative group flex-1 min-w-[min(100%,15rem)]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><input aria-label="Search jobs" value={query} onChange={onQueryChange} placeholder="Search title, company, or location..." className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50" /></div>
      {(['All', 'Summer 2027', 'New Grad'] as Category[]).map((item) => <button type="button" key={item} onClick={() => onCategoryChange(item)} className={`px-3 py-2 rounded-lg text-xs font-medium border ${category === item ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>{item}</button>)}
      <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer"><input type="checkbox" checked={remoteOnly} onChange={(e) => onRemoteChange(e.target.checked)} className="accent-cyan-500" /> Remote Only</label>
      <button type="button" onClick={onClear} className="flex items-center gap-1 px-2 py-2 text-xs text-zinc-500 hover:text-zinc-200"><X className="h-3.5 w-3.5" /> Clear Filters</button>
    </div><div className="text-xs text-zinc-500">Showing <span className="text-zinc-300">{resultCount}</span> of {totalCount} jobs</div>
  </div>;
}

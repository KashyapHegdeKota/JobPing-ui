import { Search } from 'lucide-react';
import type { ChangeEvent } from 'react';

export interface FilterBarProps { query: string; onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void; }

export default function FilterBar({ query, onQueryChange }: FilterBarProps) {
  return <div className="border-b border-zinc-800 px-6 py-4 space-y-3 bg-zinc-950/70">
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative group flex-1 min-w-[min(100%,15rem)]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><input aria-label="Search jobs" value={query} onChange={onQueryChange} placeholder="Search title, company, or location..." className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50" /></div>
    </div>
  </div>;
}

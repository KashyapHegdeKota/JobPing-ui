import React from 'react';
import { Search } from 'lucide-react';

export default function Filters() {
  return (
    <div className="w-64 bg-zinc-950/50 border-r border-zinc-800 p-6 h-full flex flex-col gap-8 overflow-y-auto font-sans backdrop-blur-md">
      <div>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search filters..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <FilterSection title="Company" options={['TechCorp', 'InnoSoft', 'AlphaGen', 'Quantum']} />
        <FilterSection title="Work Model" options={['Remote', 'Hybrid', 'On-site']} />
        <FilterSection title="Role Type" options={['Full-time', 'Contract', 'Freelance']} />
        <FilterSection title="Experience Level" options={['Entry', 'Mid', 'Senior', 'Lead']} />
      </div>
    </div>
  );
}

function FilterSection({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer appearance-none w-4 h-4 border border-zinc-700 rounded bg-zinc-900 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shadow-inner"
              />
              <svg className="absolute w-3 h-3 text-cyan-950 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

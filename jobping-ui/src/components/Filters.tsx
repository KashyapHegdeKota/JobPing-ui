import React from 'react';
import { Search } from 'lucide-react';

export default function Filters() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col gap-7 border-r border-[#e2e7ed] bg-white/70 p-5 h-full overflow-y-auto" aria-label="Job discovery context">
      <div>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8793a4] group-focus-within:text-[#206653] transition-colors" />
          <input
            type="text"
            placeholder="Search filters..."
            aria-label="Search filters"
            className="w-full rounded-lg border border-[#e2e7ed] bg-[#f5f7fa] py-2 pl-9 pr-3 text-sm text-[#17243a] placeholder-[#98a3b2] outline-none transition-all focus:border-[#b7dcca] focus:ring-2 focus:ring-[#b7f1d7]/60"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <FilterSection title="Company" options={['TechCorp', 'InnoSoft', 'AlphaGen', 'Quantum']} />
        <FilterSection title="Work Model" options={['Remote', 'Hybrid', 'On-site']} />
        <FilterSection title="Role Type" options={['Full-time', 'Contract', 'Freelance']} />
        <FilterSection title="Experience Level" options={['Entry', 'Mid', 'Senior', 'Lead']} />
      </div>
    </aside>
  );
}

function FilterSection({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-bold text-[#8793a4] uppercase tracking-widest">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#d5dde4] bg-white transition-all checked:border-[#206653] checked:bg-[#206653]"
              />
              <svg className="absolute w-3 h-3 text-cyan-950 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-[#657389] transition-colors group-hover:text-[#17243a]">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

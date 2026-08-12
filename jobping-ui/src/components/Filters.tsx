import React from 'react';
import { Search } from 'lucide-react';

export default function Filters() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 font-mono h-full flex flex-col gap-6 overflow-y-auto">
      <div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search filters..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      <FilterSection title="Company" options={['TechCorp', 'InnoSoft', 'AlphaGen']} />
      <FilterSection title="Work Model" options={['Remote', 'Hybrid', 'On-site']} />
      <FilterSection title="Role Type" options={['Full-time', 'Contract', 'Freelance']} />
      <FilterSection title="Experience Level" options={['Entry', 'Mid', 'Senior']} />
    </div>
  );
}

function FilterSection({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 border-gray-300 rounded text-red-500 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-black">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

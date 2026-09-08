import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function Combobox({ value, onChange, options, placeholder = "Select option..." }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="flex items-center justify-between w-full min-w-[12rem] px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 focus:outline-none focus:border-cyan-500/50 hover:bg-zinc-800/50 transition-colors"
      >
        <span className="truncate">{value === 'All' ? placeholder : value}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-2 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full min-w-[16rem] mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-zinc-800 flex items-center">
              <Search className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                autoFocus
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => { onChange('All'); setIsOpen(false); }}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center justify-between transition-colors ${value === 'All' ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
              >
                {placeholder}
                {value === 'All' && <Check className="h-3.5 w-3.5" />}
              </button>
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-3 text-center text-xs text-zinc-500">No results found</div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => { onChange(option); setIsOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center justify-between transition-colors ${value === option ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    <span className="truncate">{option}</span>
                    {value === option && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from '../app/jobs-page.module.css';

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
        className={styles.select}
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
            className="absolute z-50 mt-1 w-full min-w-[16rem] overflow-hidden rounded-lg border border-[#dfe6eb] bg-white shadow-xl"
          >
            <div className="flex items-center border-b border-[#e5e9ed] p-2">
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-[#8793a4]" />
              <input
                autoFocus
                className="w-full bg-transparent text-sm text-[#17243a] placeholder-[#8793a4] focus:outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              <button
                type="button"
                onClick={() => { onChange('All'); setIsOpen(false); }}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${value === 'All' ? 'bg-[#e4f9ed] text-[#206653]' : 'text-[#42526a] hover:bg-[#f5f7fa]'}`}
              >
                {placeholder}
                {value === 'All' && <Check className="h-3.5 w-3.5" />}
              </button>
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-3 text-center text-xs text-[#8793a4]">No results found</div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => { onChange(option); setIsOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${value === option ? 'bg-[#e4f9ed] text-[#206653]' : 'text-[#42526a] hover:bg-[#f5f7fa]'}`}
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

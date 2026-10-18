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
    <div className={styles.comboboxWrap} ref={containerRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`${styles.select} ${styles.comboboxTrigger} ${value !== 'All' ? styles.selectActive : ''}`}
      >
        <span className="truncate">{value === 'All' ? placeholder : value}</span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-60 ml-2 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className={styles.comboboxPopover}
          >
            <div className={styles.comboboxSearchRow}>
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" />
              <input
                autoFocus
                className={styles.comboboxInput}
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
              />
            </div>
            <div className={styles.comboboxList} role="listbox">
              <button
                type="button"
                onClick={() => { onChange('All'); setIsOpen(false); }}
                className={`${styles.comboboxOption} ${value === 'All' ? styles.comboboxOptionActive : ''}`}
              >
                {placeholder}
                {value === 'All' && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
              {filteredOptions.length === 0 ? (
                <div className={styles.comboboxEmpty}>No results found</div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => { onChange(option); setIsOpen(false); }}
                    className={`${styles.comboboxOption} ${value === option ? styles.comboboxOptionActive : ''}`}
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

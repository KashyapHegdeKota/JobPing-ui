import { useState, useEffect } from 'react';
import { publicReference } from '../lib/publicReference';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export function useCompanies() {
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    let current = true;
    publicReference<unknown>(`${API_URL}/api/v1/companies`)
      .then(data => {
        // Extract and sort company names alphabetically
        const names = Array.isArray(data) ? data.map((c: { name: string }) => c.name) : [];
        if (current) setCompanies(names.sort());
      })
      .catch(console.error);
    return () => { current = false; };
  }, []);

  return companies;
}

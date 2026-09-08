import { useState, useEffect } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export function useCompanies() {
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/companies`)
      .then(res => res.json())
      .then(data => {
        // Extract and sort company names alphabetically
        const names = Array.isArray(data) ? data.map((c: { name: string }) => c.name) : [];
        setCompanies(names.sort());
      })
      .catch(console.error);
  }, []);

  return companies;
}

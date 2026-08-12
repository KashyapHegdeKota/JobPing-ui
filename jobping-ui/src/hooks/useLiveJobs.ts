import { useState, useEffect } from 'react';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  posted_at: string; // ISO format or timestamp
  work_model?: string;
  role_type?: string;
  experience_level?: string;
}

export function useLiveJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/v1/ws/live');

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const newJob = JSON.parse(event.data);
        setJobs((prevJobs) => [newJob, ...prevJobs]);
      } catch (error) {
        console.error('Failed to parse job data', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { jobs, isConnected };
}

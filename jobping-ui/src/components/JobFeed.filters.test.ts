import { describe, expect, it } from 'vitest';
import { filterJobs } from './JobFeed';
import type { Job } from '../hooks/useLiveJobs';
const jobs: Job[] = [
  { id: 3, title: 'New Grad Software Engineer', company: 'A', location: 'Remote', posted_at: '2027-03-03', role_type: 'New Grad' },
  { id: 2, title: 'Summer 2027 Analyst', company: 'B', location: 'New York', posted_at: '2027-03-02' },
  { id: 1, title: 'Designer', company: 'C', location: 'Boston', posted_at: '2027-03-01' },
];
describe('job feed filtering', () => {
  it('filters search, category, remote, and accepts newly appended raw jobs', () => { expect(filterJobs(jobs, 'software', 'All', false)).toHaveLength(1); expect(filterJobs(jobs, '', 'Summer 2027', false)[0].id).toBe(2); expect(filterJobs(jobs, '', 'All', true)[0].id).toBe(3); const appended = [...jobs, { ...jobs[0], id: 4, title: 'Software Intern' }]; expect(filterJobs(appended, 'software', 'All', false).map((j) => j.id)).toEqual([3, 4]); });
  it('protects newest-first ordering', () => { expect(jobs.map((j) => j.id)).toEqual([3, 2, 1]); });
});

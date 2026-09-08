import { describe, expect, it } from 'vitest';
import { formatJobDate } from './jobDates';

describe('formatJobDate', () => {
  const MAY_15_NOON = new Date(2026, 4, 15, 12, 0, 0).getTime(); // May 15, 2026 12:00:00

  it('handles "Posted today"', () => {
    // 2 hours ago on the same day
    const posted = new Date(2026, 4, 15, 10, 0, 0).toISOString();
    expect(formatJobDate({ posted_at: posted }, MAY_15_NOON)).toBe('Posted today');
  });

  it('handles "Posted yesterday"', () => {
    // Previous day, 11 PM
    const posted = new Date(2026, 4, 14, 23, 0, 0).toISOString();
    expect(formatJobDate({ posted_at: posted }, MAY_15_NOON)).toBe('Posted yesterday');
  });

  it('handles "Posted X days ago"', () => {
    // 5 days ago
    const posted = new Date(2026, 4, 10, 12, 0, 0).toISOString();
    expect(formatJobDate({ posted_at: posted }, MAY_15_NOON)).toBe('Posted 5 days ago');
  });

  it('handles "Posted about X months ago"', () => {
    // 30 days ago (1 month)
    const oneMonthAgo = new Date(2026, 3, 15, 12, 0, 0).toISOString();
    expect(formatJobDate({ posted_at: oneMonthAgo }, MAY_15_NOON)).toBe('Posted about 1 month ago');

    // 65 days ago (2 months)
    const twoMonthsAgo = new Date(2026, 2, 11, 12, 0, 0).toISOString();
    expect(formatJobDate({ posted_at: twoMonthsAgo }, MAY_15_NOON)).toBe('Posted about 2 months ago');
  });

  it('handles "Discovered X hours ago" when posted_at is missing', () => {
    // 5 hours ago
    const discovered = new Date(MAY_15_NOON - 5 * 60 * 60 * 1000).toISOString();
    expect(formatJobDate({ discovered_at: discovered }, MAY_15_NOON)).toBe('Discovered 5 hours ago');
    
    // 1 hour ago
    const discovered1h = new Date(MAY_15_NOON - 1 * 60 * 60 * 1000).toISOString();
    expect(formatJobDate({ discovered_at: discovered1h }, MAY_15_NOON)).toBe('Discovered 1 hour ago');
  });

  it('handles "Date unavailable"', () => {
    expect(formatJobDate({}, MAY_15_NOON)).toBe('Date unavailable');
    expect(formatJobDate({ posted_at: 'invalid date' }, MAY_15_NOON)).toBe('Date unavailable');
  });
});

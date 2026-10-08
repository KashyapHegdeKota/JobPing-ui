import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import DiscoveryControls from './DiscoveryControls';
import { emptyDiscoveryFilters } from '../lib/jobDetails';

afterEach(cleanup);
it('exposes role policy and distinct pay units through accessible controls', () => {
  const change = vi.fn();
  render(<DiscoveryControls value={emptyDiscoveryFilters} onChange={change} />);
  fireEvent.change(screen.getByLabelText('Role work authorization policy'), { target: { value: 'opt' } });
  expect(change).toHaveBeenLastCalledWith({ ...emptyDiscoveryFilters, policy: 'opt' });
  fireEvent.click(screen.getByLabelText('Employer has H-1B history'));
  expect(change).toHaveBeenLastCalledWith({ ...emptyDiscoveryFilters, h1bHistory: true });
  fireEvent.change(screen.getByLabelText('Pay period'), { target: { value: 'hour' } });
  expect(change).toHaveBeenLastCalledWith({ ...emptyDiscoveryFilters, interval: 'hour' });
});

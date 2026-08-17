import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import FilterBar from './FilterBar';

const props = () => ({ query: '', category: 'All' as const, remoteOnly: false, resultCount: 2, totalCount: 3, onQueryChange: vi.fn(), onCategoryChange: vi.fn(), onRemoteChange: vi.fn(), onClear: vi.fn() });
describe('FilterBar', () => {
  afterEach(() => cleanup());
  it('renders controls and reports search/category/remote/clear actions', () => { const p = props(); render(<FilterBar {...p} />); fireEvent.change(screen.getByLabelText('Search jobs'), { target: { value: 'software' } }); fireEvent.click(screen.getByRole('button', { name: 'New Grad' })); fireEvent.click(screen.getByLabelText('Remote Only')); fireEvent.click(screen.getByRole('button', { name: /Clear Filters/ })); expect(p.onQueryChange).toHaveBeenCalled(); expect(p.onCategoryChange).toHaveBeenCalledWith('New Grad'); expect(p.onRemoteChange).toHaveBeenCalledWith(true); expect(p.onClear).toHaveBeenCalled(); });
  it('shows the dynamic result count', () => { render(<FilterBar {...props()} />); expect(screen.getByText((_, element) => element?.textContent === 'Showing 2 of 3 jobs')).toBeInTheDocument(); });
});

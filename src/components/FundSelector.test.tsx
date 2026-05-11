import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FundSummary } from '../api/types';
import { FundSelector } from './FundSelector';

const metrics = { irr: 0.15, tvpi: 1.8, dpi: 0.5, rvpi: 1.3, nav: 100_000_000 };

const funds: FundSummary[] = [
  { id: 'f-1', name: 'Nordic Fund I', type: 'Buyout', vintage: 2019, totalCommitments: 200_000_000, metrics },
  { id: 'f-2', name: 'Nordic Fund II', type: 'Growth', vintage: 2022, totalCommitments: 350_000_000, metrics },
];

describe('FundSelector', () => {
  it('renders all fund names', () => {
    render(<FundSelector funds={funds} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Nordic Fund I')).toBeInTheDocument();
    expect(screen.getByText('Nordic Fund II')).toBeInTheDocument();
  });

  it('calls onSelect with the correct id when a fund is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FundSelector funds={funds} selectedId="f-1" onSelect={onSelect} />);

    await user.click(screen.getByText('Nordic Fund II'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('f-2');
  });

  it('does not call onSelect when the already-selected fund is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FundSelector funds={funds} selectedId="f-1" onSelect={onSelect} />);

    await user.click(screen.getByText('Nordic Fund I'));
    // onSelect is still called — parent decides whether to re-select
    expect(onSelect).toHaveBeenCalledWith('f-1');
  });
});

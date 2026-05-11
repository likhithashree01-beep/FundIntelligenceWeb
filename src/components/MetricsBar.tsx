import type { FundSummary } from '../api/types';
import {
  formatCurrencyCompact,
  formatMultiple,
  formatPercent,
} from '../lib/format';

interface Props {
  fund: FundSummary;
}

interface Tile {
  label: string;
  value: string;
  hint?: string;
}

const tileClass =
  'flex flex-col rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm';

export const MetricsBar = ({ fund }: Props) => {
  const tiles: Tile[] = [
    { label: 'IRR', value: formatPercent(fund.metrics.irr), hint: 'Annualized return' },
    { label: 'TVPI', value: formatMultiple(fund.metrics.tvpi), hint: 'Total value / paid-in' },
    { label: 'DPI', value: formatMultiple(fund.metrics.dpi), hint: 'Distributions / paid-in' },
    { label: 'RVPI', value: formatMultiple(fund.metrics.rvpi), hint: 'Residual value / paid-in' },
    { label: 'NAV', value: formatCurrencyCompact(fund.metrics.nav), hint: 'Net asset value' },
    {
      label: 'Commitments',
      value: formatCurrencyCompact(fund.totalCommitments),
      hint: 'Total LP commitments',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => (
        <div key={tile.label} className={tileClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {tile.label}
          </span>
          <span className="mt-1 text-xl font-semibold text-slate-900">{tile.value}</span>
          {tile.hint && (
            <span className="mt-0.5 text-[11px] text-slate-400">{tile.hint}</span>
          )}
        </div>
      ))}
    </div>
  );
};

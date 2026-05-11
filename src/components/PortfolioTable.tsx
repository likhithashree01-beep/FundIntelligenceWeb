import type { PortfolioCompany } from '../api/types';
import { formatCurrencyCompact, formatPercent } from '../lib/format';
import { FlagBadge } from './FlagBadge';

interface Props {
  companies: PortfolioCompany[];
}

const rowHighlight = (flags: string[]): string => {
  if (flags.includes('at-risk')) return 'bg-rose-50/40 dark:bg-rose-950/30';
  if (flags.includes('watch')) return 'bg-amber-50/40 dark:bg-amber-950/30';
  return '';
};

export const PortfolioTable = ({ companies }: Props) => {
  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
        No portfolio companies match the current filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">EBITDA</th>
              <th className="px-4 py-3 text-right">Margin</th>
              <th className="px-4 py-3 text-right">Invested</th>
              <th className="px-4 py-3 text-right">Current value</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {companies.map((c) => {
              const moic = c.investedCapital > 0 ? c.currentValue / c.investedCapital : 0;
              const moicClass =
                moic >= 1.5
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : moic >= 1
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-rose-700 dark:text-rose-400';
              return (
                <tr
                  key={c.id}
                  className={`${rowHighlight(c.flags)} hover:bg-slate-50/60 dark:hover:bg-slate-700/40`}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {c.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                    {c.sector}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                    {c.country}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 tabular-nums dark:text-slate-300">
                    {formatCurrencyCompact(c.revenue)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                      c.ebitda < 0
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatCurrencyCompact(c.ebitda)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                      c.ebitdaMargin < 0
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatPercent(c.ebitdaMargin)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 tabular-nums dark:text-slate-300">
                    {formatCurrencyCompact(c.investedCapital)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums ${moicClass}`}
                    title={`${moic.toFixed(2)}x MOIC`}
                  >
                    {formatCurrencyCompact(c.currentValue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-1">
                      {c.flags.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                      ) : (
                        c.flags.map((flag) => <FlagBadge key={flag} flag={flag} />)
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

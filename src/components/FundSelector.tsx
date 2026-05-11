import type { FundSummary } from '../api/types';

interface Props {
  funds: FundSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const FundSelector = ({ funds, selectedId, onSelect }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {funds.map((fund) => {
        const active = fund.id === selectedId;
        return (
          <button
            key={fund.id}
            type="button"
            onClick={() => onSelect(fund.id)}
            className={`group flex flex-col items-start rounded-lg border px-4 py-3 text-left transition ${
              active
                ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span
              className={`text-xs uppercase tracking-wide ${
                active ? 'text-brand-700' : 'text-slate-500'
              }`}
            >
              {fund.type} · {fund.vintage}
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-900">{fund.name}</span>
          </button>
        );
      })}
    </div>
  );
};

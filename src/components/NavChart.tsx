import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { NavPoint } from '../api/types';
import { formatCurrencyCompact, formatCurrencyFull, formatMonth } from '../lib/format';

interface Props {
  data: NavPoint[];
}

interface TooltipPayload {
  active?: boolean;
  label?: string;
  payload?: { value: number }[];
}

const ChartTooltip = ({ active, label, payload }: TooltipPayload) => {
  if (!active || !payload || payload.length === 0 || !label) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-medium">{formatMonth(label)}</div>
      <div className="mt-0.5 text-slate-200">NAV: {formatCurrencyFull(value)}</div>
    </div>
  );
};

export const NavChart = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        No NAV history in the selected range.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            width={64}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="nav"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2563eb' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

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
import { useTheme } from '../lib/theme';

interface Props {
  data: NavPoint[];
}

interface TooltipPayload {
  active?: boolean;
  label?: string;
  payload?: { value: number }[];
}

const ChartTooltip = ({ active, label, payload }: TooltipPayload) => {
  const { theme } = useTheme();
  if (!active || !payload || payload.length === 0 || !label) return null;
  const value = payload[0].value;
  return (
    <div
      className={`rounded-md px-3 py-2 text-xs shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-700 text-slate-100'
          : 'bg-slate-900 text-white'
      }`}
    >
      <div className="font-medium">{formatMonth(label)}</div>
      <div className={`mt-0.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-200'}`}>
        NAV: {formatCurrencyFull(value)}
      </div>
    </div>
  );
};

export const NavChart = ({ data }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const axisStroke = isDark ? '#475569' : '#cbd5e1';
  const cursorStroke = isDark ? '#64748b' : '#94a3b8';

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No NAV history in the selected range.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fill: tickFill, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: axisStroke }}
          />
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fill: tickFill, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: axisStroke }}
            width={64}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: cursorStroke, strokeWidth: 1 }} />
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

// Tiny formatting helpers — used across components.

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatCurrencyCompact = (value: number): string => `$${compactNumber.format(value)}`;

export const formatCurrencyFull = (value: number): string => fullCurrency.format(value);

export const formatMultiple = (value: number): string => `${value.toFixed(2)}x`;

export const formatPercent = (value: number): string => `${percent.format(value)}%`;

export const formatMonth = (yyyyMm: string): string => {
  // "2024-03" -> "Mar 2024"
  const [year, month] = yyyyMm.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

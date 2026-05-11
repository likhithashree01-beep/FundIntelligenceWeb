import { describe, expect, it } from 'vitest';
import {
  formatCurrencyCompact,
  formatCurrencyFull,
  formatMonth,
  formatMultiple,
  formatPercent,
} from './format';

describe('formatCurrencyCompact', () => {
  it('formats millions with one decimal', () => {
    expect(formatCurrencyCompact(1_500_000)).toBe('$1.5M');
  });

  it('formats thousands', () => {
    expect(formatCurrencyCompact(250_000)).toBe('$250K');
  });

  it('formats zero', () => {
    expect(formatCurrencyCompact(0)).toBe('$0');
  });

  it('formats negative values', () => {
    // Intl.NumberFormat compact puts the sign after the currency symbol: $-2M
    expect(formatCurrencyCompact(-2_000_000)).toBe('$-2M');
  });
});

describe('formatCurrencyFull', () => {
  it('formats with dollar sign and no decimals', () => {
    expect(formatCurrencyFull(1_234_567)).toBe('$1,234,567');
  });

  it('rounds fractional values', () => {
    expect(formatCurrencyFull(999.9)).toBe('$1,000');
  });
});

describe('formatMultiple', () => {
  it('formats to two decimal places with x suffix', () => {
    expect(formatMultiple(1.5)).toBe('1.50x');
    expect(formatMultiple(2)).toBe('2.00x');
  });

  it('handles sub-1x (loss) multiples', () => {
    expect(formatMultiple(0.75)).toBe('0.75x');
  });
});

describe('formatPercent', () => {
  it('formats positive percentage with one decimal', () => {
    expect(formatPercent(12.3)).toBe('12.3%');
  });

  it('formats negative percentage', () => {
    expect(formatPercent(-5.5)).toBe('-5.5%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });
});

describe('formatMonth', () => {
  it('converts YYYY-MM to short month + year', () => {
    expect(formatMonth('2024-03')).toBe('Mar 2024');
    expect(formatMonth('2024-12')).toBe('Dec 2024');
    expect(formatMonth('2023-01')).toBe('Jan 2023');
  });
});

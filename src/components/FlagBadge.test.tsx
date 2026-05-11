import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlagBadge } from './FlagBadge';

describe('FlagBadge', () => {
  it('renders "Watch" label for watch flag', () => {
    render(<FlagBadge flag="watch" />);
    expect(screen.getByText('Watch')).toBeInTheDocument();
  });

  it('renders "At risk" label for at-risk flag', () => {
    render(<FlagBadge flag="at-risk" />);
    expect(screen.getByText('At risk')).toBeInTheDocument();
  });

  it('renders the raw flag value for unknown flags', () => {
    render(<FlagBadge flag="exiting" />);
    expect(screen.getByText('exiting')).toBeInTheDocument();
  });
});

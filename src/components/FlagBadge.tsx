interface Props {
  flag: string;
}

const stylesByFlag: Record<string, string> = {
  watch: 'bg-amber-50 text-amber-800 ring-amber-200',
  'at-risk': 'bg-rose-50 text-rose-800 ring-rose-200',
};

const labelsByFlag: Record<string, string> = {
  watch: 'Watch',
  'at-risk': 'At risk',
};

export const FlagBadge = ({ flag }: Props) => {
  const className = stylesByFlag[flag] ?? 'bg-slate-50 text-slate-700 ring-slate-200';
  const label = labelsByFlag[flag] ?? flag;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
};

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { fetchFundDetail, fetchFunds, fetchPerformance } from '../api/funds';
import { useAuth } from '../auth/AuthContext';
import { FundSelector } from '../components/FundSelector';
import { MetricsBar } from '../components/MetricsBar';
import { NavChart } from '../components/NavChart';
import { PortfolioTable } from '../components/PortfolioTable';

type FlagFilter = 'all' | 'watch' | 'at-risk';

const filterButtonClass = (active: boolean): string =>
  `rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
    active
      ? 'bg-brand-600 text-white ring-brand-600'
      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
  }`;

export const DashboardPage = () => {
  const { logout } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flagFilter, setFlagFilter] = useState<FlagFilter>('all');

  const fundsQuery = useQuery({
    queryKey: ['funds'],
    queryFn: fetchFunds,
  });

  // Pick the first fund as the default once the list loads.
  useEffect(() => {
    if (!selectedId && fundsQuery.data?.funds.length) {
      setSelectedId(fundsQuery.data.funds[0].id);
    }
  }, [fundsQuery.data, selectedId]);

  const detailQuery = useQuery({
    queryKey: ['fund', selectedId],
    queryFn: () => fetchFundDetail(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const performanceQuery = useQuery({
    queryKey: ['performance', selectedId],
    queryFn: () => fetchPerformance(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const filteredCompanies = useMemo(() => {
    if (!detailQuery.data) return [];
    if (flagFilter === 'all') return detailQuery.data.portfolioCompanies;
    return detailQuery.data.portfolioCompanies.filter((c) => c.flags.includes(flagFilter));
  }, [detailQuery.data, flagFilter]);

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Nordic Analytics</h1>
            <p className="text-xs text-slate-500">Fund Intelligence Dashboard</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Funds
          </h2>
          {fundsQuery.isPending && <SkeletonRow />}
          {fundsQuery.isError && (
            <ErrorBanner message="Couldn't load funds." retry={() => fundsQuery.refetch()} />
          )}
          {fundsQuery.data && (
            <FundSelector
              funds={fundsQuery.data.funds}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </section>

        {detailQuery.data && (
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {detailQuery.data.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {detailQuery.data.type} · Vintage {detailQuery.data.vintage}
                </p>
              </div>
            </div>
            <MetricsBar fund={detailQuery.data} />
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              NAV performance
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {performanceQuery.isPending && (
              <div className="h-72 animate-pulse rounded bg-slate-100" />
            )}
            {performanceQuery.isError && (
              <ErrorBanner
                message="Couldn't load performance data."
                retry={() => performanceQuery.refetch()}
              />
            )}
            {performanceQuery.data && <NavChart data={performanceQuery.data.navHistory} />}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Portfolio companies
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className={filterButtonClass(flagFilter === 'all')}
                onClick={() => setFlagFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={filterButtonClass(flagFilter === 'watch')}
                onClick={() => setFlagFilter('watch')}
              >
                Watch
              </button>
              <button
                type="button"
                className={filterButtonClass(flagFilter === 'at-risk')}
                onClick={() => setFlagFilter('at-risk')}
              >
                At risk
              </button>
            </div>
          </div>

          {detailQuery.isPending && <SkeletonRow />}
          {detailQuery.isError && (
            <ErrorBanner
              message="Couldn't load fund details."
              retry={() => detailQuery.refetch()}
            />
          )}
          {detailQuery.data && <PortfolioTable companies={filteredCompanies} />}
        </section>
      </main>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
);

interface ErrorBannerProps {
  message: string;
  retry: () => void;
}

const ErrorBanner = ({ message, retry }: ErrorBannerProps) => (
  <div className="flex items-center justify-between rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
    <span>{message}</span>
    <button
      type="button"
      onClick={retry}
      className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
    >
      Retry
    </button>
  </div>
);

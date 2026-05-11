import { apiRequest } from './client';
import type {
  AuthTokens,
  FundDetail,
  FundSummary,
  PerformanceResponse,
  PortfolioCompany,
} from './types';

export const login = (email: string, password: string): Promise<AuthTokens> =>
  apiRequest<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });

export const fetchFunds = (): Promise<{ funds: FundSummary[] }> =>
  apiRequest<{ funds: FundSummary[] }>('/api/funds');

export const fetchFundDetail = (id: string): Promise<FundDetail> =>
  apiRequest<FundDetail>(`/api/funds/${id}`);

export const fetchPerformance = (
  id: string,
  range?: { from?: string; to?: string },
): Promise<PerformanceResponse> => {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  const query = params.toString();
  return apiRequest<PerformanceResponse>(
    `/api/funds/${id}/performance${query ? `?${query}` : ''}`,
  );
};

export const fetchPortfolio = (
  id: string,
  flag?: string,
): Promise<{ fundId: string; flag: string | null; portfolioCompanies: PortfolioCompany[] }> => {
  const query = flag ? `?flag=${encodeURIComponent(flag)}` : '';
  return apiRequest(`/api/funds/${id}/portfolio${query}`);
};

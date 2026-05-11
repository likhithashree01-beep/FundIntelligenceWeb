// Mirrors the response shapes from the Fund Intelligence API.
// Keep this in sync with backend/src/types.ts.

export interface FundMetrics {
  irr: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  nav: number;
}

export interface FundSummary {
  id: string;
  name: string;
  type: string;
  vintage: number;
  totalCommitments: number;
  metrics: FundMetrics;
}

export interface NavPoint {
  month: string;
  nav: number;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  country: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  status: string;
  investmentDate: string;
  investedCapital: number;
  currentValue: number;
  flags: string[];
}

export interface FundDetail extends FundSummary {
  navHistory: NavPoint[];
  portfolioCompanies: PortfolioCompany[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}

export interface PerformanceResponse {
  fundId: string;
  from: string | null;
  to: string | null;
  navHistory: NavPoint[];
}

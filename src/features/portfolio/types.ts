import type { BuildingListItem } from '@/features/buildings/types';

export type PortfolioBuilding = BuildingListItem & {
  monthlyRent?: number;
  monthlyExpenses?: number | null;
  netIncome?: number | null;
  openRequests?: number;
};

export type PortfolioSummary = {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  monthlyRent: number;
  monthlyExpenses?: number | null;
  netIncome?: number | null;
  deltaVsPreviousPeriod?: number | null;
  netIncomeDeltaPct?: number | null;
};

export type PortfolioDashboard = {
  buildings: PortfolioBuilding[];
  summary: PortfolioSummary;
};

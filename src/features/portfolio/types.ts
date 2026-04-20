import type { UserRef } from '@/features/requests/types';

export type PortfolioBuildingExpenses = {
  totalAmount: number;
  byCategory: Record<string, number>;
  count: number;
};

export type PortfolioBuilding = {
  id: string;
  name: string;
  address: string;
  maintainer: UserRef | null;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalMonthlyRent: number;
  expenses: PortfolioBuildingExpenses;
};

export type PortfolioTotals = {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalMonthlyRent: number;
  totalExpenses: number;
  netIncome: number;
};

export type PortfolioDashboard = {
  buildings: PortfolioBuilding[];
  totals: PortfolioTotals;
};

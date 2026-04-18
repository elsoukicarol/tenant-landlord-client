import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';

import type { PortfolioDashboard } from './types';

export const portfolioKeys = {
  dashboard: (period?: string) => ['portfolio', 'dashboard', period] as const,
};

export function usePortfolioDashboard(period?: string) {
  return useQuery({
    queryKey: portfolioKeys.dashboard(period),
    queryFn: async () => {
      const res = await api.get<PortfolioDashboard>('/portfolio/dashboard', {
        ...(period ? { period } : {}),
      });
      return res.data;
    },
    staleTime: 60_000,
  });
}

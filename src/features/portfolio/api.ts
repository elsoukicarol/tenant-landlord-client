import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';

import type { PortfolioDashboard } from './types';

export const portfolioKeys = {
  dashboard: ['portfolio', 'dashboard'] as const,
};

export function usePortfolioDashboard() {
  return useQuery({
    queryKey: portfolioKeys.dashboard,
    queryFn: async () => {
      const res = await api.get<PortfolioDashboard>('/portfolio/dashboard');
      return res.data;
    },
    staleTime: 60_000,
  });
}

import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type { Building, BuildingListItem, UnitSummary } from './types';

const DEFAULT_LIMIT = 20;

export const buildingKeys = {
  all: ['buildings'] as const,
  list: ['buildings', 'list'] as const,
  detail: (id: string) => ['buildings', 'detail', id] as const,
  units: (id: string) => ['buildings', 'units', id] as const,
};

export function useBuildingList() {
  return useInfiniteQuery<
    ApiResponse<BuildingListItem[]>,
    Error,
    InfiniteData<ApiResponse<BuildingListItem[]>>,
    typeof buildingKeys.list,
    number
  >({
    queryKey: buildingKeys.list,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.get<BuildingListItem[]>('/buildings', {
        page: pageParam,
        limit: DEFAULT_LIMIT,
      }),
    getNextPageParam: (last, pages) => {
      const total = last.pagination?.total ?? 0;
      const fetched = pages.length * DEFAULT_LIMIT;
      return fetched < total ? pages.length + 1 : undefined;
    },
  });
}

export function useBuilding(id: string | undefined) {
  return useQuery({
    queryKey: id ? buildingKeys.detail(id) : ['buildings', 'detail', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('building id is required');
      const res = await api.get<Building>(`/buildings/${id}`);
      return res.data;
    },
  });
}

export function useBuildingUnits(id: string | undefined) {
  return useQuery({
    queryKey: id ? buildingKeys.units(id) : ['buildings', 'units', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('building id is required');
      const res = await api.get<UnitSummary[]>(`/buildings/${id}/units`);
      return res.data;
    },
  });
}

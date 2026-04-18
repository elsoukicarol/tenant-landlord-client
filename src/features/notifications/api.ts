import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type { Notification } from './types';

const DEFAULT_LIMIT = 20;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

export function useNotificationList() {
  return useInfiniteQuery<
    ApiResponse<Notification[]>,
    Error,
    InfiniteData<ApiResponse<Notification[]>>,
    typeof notificationKeys.list,
    number
  >({
    queryKey: notificationKeys.list,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.get<Notification[]>('/notifications', {
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

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.post<null>(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post<null>('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}

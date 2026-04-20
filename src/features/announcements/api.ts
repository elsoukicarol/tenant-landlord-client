import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type { Announcement, AnnouncementListItem, AnnouncementType } from './types';

const DEFAULT_LIMIT = 20;

export const announcementKeys = {
  all: ['announcements'] as const,
  list: ['announcements', 'list'] as const,
  detail: (id: string) => ['announcements', 'detail', id] as const,
};

export function useAnnouncementList() {
  return useInfiniteQuery<
    ApiResponse<AnnouncementListItem[]>,
    Error,
    InfiniteData<ApiResponse<AnnouncementListItem[]>>,
    typeof announcementKeys.list,
    number
  >({
    queryKey: announcementKeys.list,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.get<AnnouncementListItem[]>('/announcements', {
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

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: id ? announcementKeys.detail(id) : ['announcements', 'detail', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('announcement id is required');
      const res = await api.get<Announcement>(`/announcements/${id}`);
      return res.data;
    },
  });
}

export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Announcement> => {
      const res = await api.patch<Announcement>(`/announcements/${id}/read`);
      return res.data;
    },
    onSuccess: (ann) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.list });
      queryClient.setQueryData(announcementKeys.detail(ann.id), ann);
    },
  });
}

export type CreateAnnouncementInput = {
  buildingId: string;
  title: string;
  message: string;
  type: AnnouncementType;
  scheduledDate?: string;
  unitIds?: string[];
};

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput): Promise<Announcement> => {
      const res = await api.post<Announcement>('/announcements', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

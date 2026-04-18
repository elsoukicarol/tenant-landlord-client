import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type { InvitationCounts, InvitationListItem, InvitationRole } from './types';

const DEFAULT_LIMIT = 20;

export const invitationKeys = {
  all: ['invitations'] as const,
  list: ['invitations', 'list'] as const,
};

type ListEnvelope = ApiResponse<InvitationListItem[]> & {
  counts?: InvitationCounts;
};

export function useInvitationList() {
  return useInfiniteQuery<
    ListEnvelope,
    Error,
    InfiniteData<ListEnvelope>,
    typeof invitationKeys.list,
    number
  >({
    queryKey: invitationKeys.list,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<InvitationListItem[]>('/invitations', {
        page: pageParam,
        limit: DEFAULT_LIMIT,
      });
      // The server includes an optional `counts` field alongside `pagination` in
      // the envelope. Our generic unwrap drops it; re-attach for UI.
      return res as ListEnvelope;
    },
    getNextPageParam: (last, pages) => {
      const total = last.pagination?.total ?? 0;
      const fetched = pages.length * DEFAULT_LIMIT;
      return fetched < total ? pages.length + 1 : undefined;
    },
  });
}

export type CreateInvitationInput = {
  email: string;
  role: InvitationRole;
  buildingId: string;
  unitId?: string;
};

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInvitationInput): Promise<InvitationListItem> => {
      const res = await api.post<InvitationListItem>('/invitations', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.post<null>(`/invitations/${id}/resend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete<null>(`/invitations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
    },
  });
}

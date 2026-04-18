import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type {
  Category,
  Comment,
  Priority,
  RequestDetail,
  RequestListItem,
  RequestStatus,
  ScheduleProposal,
} from './types';

export type ListParams = {
  status?: RequestStatus;
  buildingId?: string;
  limit?: number;
};

const DEFAULT_LIMIT = 20;

export const requestKeys = {
  all: ['requests'] as const,
  list: (params: ListParams) => ['requests', 'list', params] as const,
  detail: (id: string) => ['requests', 'detail', id] as const,
  schedule: (id: string) => ['requests', 'schedule', id] as const,
};

export function useRequestList(params: ListParams = {}) {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const status = params.status;
  const buildingId = params.buildingId;
  return useInfiniteQuery<
    ApiResponse<RequestListItem[]>,
    Error,
    InfiniteData<ApiResponse<RequestListItem[]>>,
    readonly ['requests', 'list', ListParams],
    number
  >({
    queryKey: ['requests', 'list', { status, buildingId, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.get<RequestListItem[]>('/maintenance-requests', {
        page: pageParam,
        limit,
        ...(status ? { status } : {}),
        ...(buildingId ? { buildingId } : {}),
      }),
    getNextPageParam: (last, pages) => {
      const total = last.pagination?.total ?? 0;
      const fetched = pages.length * limit;
      return fetched < total ? pages.length + 1 : undefined;
    },
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: id ? requestKeys.detail(id) : ['requests', 'detail', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('request id is required');
      const res = await api.get<RequestDetail>(`/maintenance-requests/${id}`);
      return res.data;
    },
  });
}

export function useRequestSchedule(id: string | undefined) {
  return useQuery({
    queryKey: id ? requestKeys.schedule(id) : ['requests', 'schedule', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('request id is required');
      const res = await api.get<ScheduleProposal[]>(`/maintenance-requests/${id}/schedule`);
      return res.data;
    },
  });
}

export type CreateRequestInput = {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  photos: { uri: string; name: string; type: string }[];
};

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRequestInput): Promise<RequestDetail> => {
      const form = new FormData();
      form.append('title', input.title);
      form.append('description', input.description);
      form.append('category', input.category);
      form.append('priority', input.priority);
      for (const photo of input.photos) {
        form.append('photos[]', {
          uri: photo.uri,
          name: photo.name,
          type: photo.type,
          // React Native's FormData accepts a file-like object; TS typings
          // treat it as string | Blob so we coerce.
        } as unknown as Blob);
      }
      const res = await api.upload<RequestDetail>('/maintenance-requests', form);
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export function useAcknowledgeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<RequestDetail> => {
      const res = await api.post<RequestDetail>(`/maintenance-requests/${id}/acknowledge`);
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export type ResolveInput = {
  id: string;
  notes: string;
  evidence: { uri: string; name: string; type: string }[];
  autoGeneratePdf?: boolean;
};

export function useResolveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ResolveInput): Promise<RequestDetail> => {
      const form = new FormData();
      form.append('notes', input.notes);
      form.append('autoGeneratePdf', String(input.autoGeneratePdf ?? true));
      for (const file of input.evidence) {
        form.append('evidence[]', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob);
      }
      const res = await api.upload<RequestDetail>(
        `/maintenance-requests/${input.id}/resolve`,
        form,
      );
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export type SignOffInput = {
  id: string;
  signedPdf?: { uri: string; name: string; type: string };
};

export function useSignOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SignOffInput): Promise<RequestDetail> => {
      const form = new FormData();
      if (input.signedPdf) {
        form.append('signedPdf', {
          uri: input.signedPdf.uri,
          name: input.signedPdf.name,
          type: input.signedPdf.type,
        } as unknown as Blob);
      }
      const res = await api.upload<RequestDetail>(
        `/maintenance-requests/${input.id}/sign-off`,
        form,
      );
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export type DisputeInput = {
  id: string;
  reason: string;
  notes: string;
};

export function useDisputeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DisputeInput): Promise<RequestDetail> => {
      const res = await api.post<RequestDetail>(`/maintenance-requests/${input.id}/dispute`, {
        reason: input.reason,
        notes: input.notes,
      });
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export type CloseWithoutResolvingInput = { id: string; reason: string };

export function useCloseWithoutResolving() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CloseWithoutResolvingInput): Promise<RequestDetail> => {
      const res = await api.post<RequestDetail>(
        `/maintenance-requests/${input.id}/close-without-resolving`,
        { reason: input.reason },
      );
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export type AddCommentInput = { id: string; message: string };

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddCommentInput): Promise<Comment> => {
      const res = await api.post<Comment>(`/maintenance-requests/${input.id}/comments`, {
        message: input.message,
      });
      return res.data;
    },
    onSuccess: (_comment, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export type ProposeScheduleInput = {
  requestId: string;
  proposedDate: string;
  notes?: string;
};

export function useProposeSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProposeScheduleInput): Promise<ScheduleProposal> => {
      const res = await api.post<ScheduleProposal>(
        `/maintenance-requests/${input.requestId}/schedule-proposals`,
        { proposedDate: input.proposedDate, notes: input.notes ?? '' },
      );
      return res.data;
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.schedule(requestId) });
    },
  });
}

export type RespondProposalInput = {
  requestId: string;
  proposalId: string;
  reason?: string;
};

export function useAcceptProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RespondProposalInput): Promise<RequestDetail> => {
      const res = await api.post<RequestDetail>(
        `/maintenance-requests/${input.requestId}/schedule-proposals/${input.proposalId}/accept`,
      );
      return res.data;
    },
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(detail.id), detail);
    },
  });
}

export function useDeclineProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RespondProposalInput): Promise<void> => {
      await api.post<null>(
        `/maintenance-requests/${input.requestId}/schedule-proposals/${input.proposalId}/decline`,
        { reason: input.reason ?? '' },
      );
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.schedule(requestId) });
    },
  });
}

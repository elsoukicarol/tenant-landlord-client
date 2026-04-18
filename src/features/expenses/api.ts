import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/api/client';
import type { ApiResponse } from '@/api/envelope';

import type { Expense, ExpenseCategory, ExpenseListItem, ExpenseSummary } from './types';

const DEFAULT_LIMIT = 20;

export type ExpenseListParams = {
  buildingId?: string;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
};

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (params: ExpenseListParams) => ['expenses', 'list', params] as const,
  detail: (id: string) => ['expenses', 'detail', id] as const,
  summary: (from: string, to: string, buildingId?: string) =>
    ['expenses', 'summary', { from, to, buildingId }] as const,
};

export function useExpenseList(params: ExpenseListParams = {}) {
  const { buildingId, category, from, to } = params;
  return useInfiniteQuery<
    ApiResponse<ExpenseListItem[]>,
    Error,
    InfiniteData<ApiResponse<ExpenseListItem[]>>,
    readonly ['expenses', 'list', ExpenseListParams],
    number
  >({
    queryKey: ['expenses', 'list', { buildingId, category, from, to }],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.get<ExpenseListItem[]>('/expenses', {
        page: pageParam,
        limit: DEFAULT_LIMIT,
        sort: 'date:desc',
        ...(buildingId ? { buildingId } : {}),
        ...(category ? { category } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }),
    getNextPageParam: (last, pages) => {
      const total = last.pagination?.total ?? 0;
      const fetched = pages.length * DEFAULT_LIMIT;
      return fetched < total ? pages.length + 1 : undefined;
    },
  });
}

export function useExpenseSummary(from: string, to: string, buildingId?: string) {
  return useQuery({
    queryKey: expenseKeys.summary(from, to, buildingId),
    queryFn: async () => {
      const res = await api.get<ExpenseSummary>('/expenses/summary', {
        from,
        to,
        ...(buildingId ? { buildingId } : {}),
      });
      return res.data;
    },
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: id ? expenseKeys.detail(id) : ['expenses', 'detail', 'empty'],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('expense id is required');
      const res = await api.get<Expense>(`/expenses/${id}`);
      return res.data;
    },
  });
}

export type CreateExpenseInput = {
  buildingId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  linkedRequestId?: string;
  receipt?: { uri: string; name: string; type: string };
};

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateExpenseInput): Promise<Expense> => {
      const form = new FormData();
      form.append('buildingId', input.buildingId);
      form.append('description', input.description);
      form.append('amount', input.amount.toString());
      form.append('category', input.category);
      form.append('date', input.date);
      if (input.linkedRequestId) form.append('linkedRequestId', input.linkedRequestId);
      if (input.receipt) {
        form.append('receipt', {
          uri: input.receipt.uri,
          name: input.receipt.name,
          type: input.receipt.type,
        } as unknown as Blob);
      }
      const res = await api.upload<Expense>('/expenses', form);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export type FlagExpenseInput = { id: string; reason: string; notes: string };

export function useFlagExpense() {
  return useMutation({
    mutationFn: async (input: FlagExpenseInput): Promise<void> => {
      await api.post<null>(`/expenses/${input.id}/flag`, {
        reason: input.reason,
        notes: input.notes,
      });
    },
  });
}

import type { Category, UserRef } from '@/features/requests/types';

export { CATEGORIES as EXPENSE_CATEGORIES } from '@/features/requests/types';
export type ExpenseCategory = Category;

export type ExpenseListItem = {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  building?: { id: string; name: string };
  recordedBy?: UserRef;
  receiptUrl?: string | null;
  linkedRequestId?: string | null;
};

export type Expense = ExpenseListItem;

export type ExpenseSummary = {
  totalExpenses: number;
  count: number;
  byCategory: Partial<Record<ExpenseCategory, number>>;
};

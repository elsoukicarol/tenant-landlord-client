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
  requestId?: string | null;
};

export type Expense = ExpenseListItem;

export type ExpenseCategoryBreakdown = {
  category: ExpenseCategory;
  amount: number;
  entryCount: number;
};

/**
 * Shape returned by GET /expenses/summary. Matches the server exactly.
 */
export type ExpenseSummary = {
  totalAmount: number;
  currency: string;
  entryCount: number;
  topCategory: ExpenseCategory | null;
  byCategory: ExpenseCategoryBreakdown[];
  from: string;
  to: string;
};

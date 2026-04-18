export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type SuccessEnvelope<T> = {
  success: true;
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  pagination?: PaginationMeta;
  unreadCount?: number;
};

export type ApiResponse<T> = {
  data: T;
  pagination?: PaginationMeta;
  unreadCount?: number;
};

export function unwrap<T>(envelope: SuccessEnvelope<T>): ApiResponse<T> {
  return {
    data: envelope.data,
    pagination: envelope.pagination,
    unreadCount: envelope.unreadCount,
  };
}

export function hasMorePages(pagination: PaginationMeta | undefined): boolean {
  if (!pagination) return false;
  return pagination.page * pagination.limit < pagination.total;
}

import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

import { useAuthStore } from '@/features/auth/store';
import { env } from '@/lib/env';

import { type ApiResponse, unwrap } from './envelope';
import { ApiError, type ApiErrorEnvelope } from './errors';

const instance: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message = body?.message ?? error.message ?? 'Network error';
    const errors = Array.isArray(body?.errors) ? body.errors : [];
    const details = (body?.details ?? {}) as Record<string, unknown>;

    if (status === 401) {
      // Token is invalid or expired — drop session globally.
      await useAuthStore.getState().signOut();
    }

    throw new ApiError(status, message, errors, details);
  },
);

async function request<T>(
  method: 'get' | 'post' | 'patch' | 'delete' | 'put',
  url: string,
  options: {
    params?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResponse<T>> {
  const response = await instance.request({
    method,
    url,
    params: options.params,
    data: options.data,
    headers: options.headers,
  });
  return unwrap<T>(response.data);
}

export const api = {
  raw: instance,
  get: <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> =>
    request<T>('get', url, { params }),
  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    request<T>('post', url, { data }),
  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    request<T>('patch', url, { data }),
  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    request<T>('put', url, { data }),
  delete: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    request<T>('delete', url, { data }),
  upload: <T>(url: string, form: FormData): Promise<ApiResponse<T>> =>
    request<T>('post', url, {
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

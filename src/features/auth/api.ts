import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import { setLanguage } from '@/lib/i18n';

import type {
  AcceptInvitationInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from './schemas';
import { type AuthUser, useAuthStore } from './store';

function syncLocale(user: AuthUser | null | undefined): void {
  if (user?.language === 'es' || user?.language === 'en') {
    setLanguage(user.language);
  }
}

type LoginResponse = { token: string; user: AuthUser };
type InvitationPreview = {
  id: string;
  email: string;
  role: 'tenant' | 'maintainer';
  inviter?: { id: string; name: string };
  building?: { id: string; name: string };
  unit?: { id: string; number: string };
};

const AUTH_ME_KEY = ['auth', 'me'] as const;

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResponse> => {
      const res = await api.post<LoginResponse>('/auth/login', input);
      return res.data;
    },
    onSuccess: async ({ token, user }) => {
      await useAuthStore.getState().setSession(token, user);
      syncLocale(user);
    },
  });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    enabled,
    queryFn: async () => {
      const res = await api.get<AuthUser>('/auth/me');
      useAuthStore.getState().setUser(res.data);
      syncLocale(res.data);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<AuthUser> => {
      const res = await api.patch<AuthUser>('/auth/me', input);
      return res.data;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
      queryClient.setQueryData(AUTH_ME_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await api.post<null>('/auth/logout');
      } catch {
        // Even if the server call fails (offline, already invalidated), we
        // still drop the session locally — the user asked to sign out.
      }
    },
    onSettled: async () => {
      await useAuthStore.getState().signOut();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input: ForgotPasswordInput): Promise<void> => {
      await api.post<null>('/auth/forgot-password', input);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: ResetPasswordInput & { token: string }): Promise<void> => {
      await api.post<null>('/auth/reset-password', {
        token: input.token,
        newPassword: input.password,
      });
    },
  });
}

export function useInvitationByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['invitations', 'by-token', token],
    enabled: Boolean(token),
    queryFn: async (): Promise<InvitationPreview> => {
      if (!token) throw new Error('invitation token is required');
      const res = await api.get<InvitationPreview>(`/invitations/by-token/${token}`);
      return res.data;
    },
    retry: false,
  });
}

export function useAcceptInvitation(token: string | undefined) {
  return useMutation({
    mutationFn: async (input: AcceptInvitationInput): Promise<LoginResponse> => {
      if (!token) throw new Error('invitation token is required');
      const res = await api.post<LoginResponse>(`/invitations/by-token/${token}/accept`, {
        name: input.name,
        password: input.password,
      });
      return res.data;
    },
    onSuccess: async ({ token: authToken, user }) => {
      await useAuthStore.getState().setSession(authToken, user);
    },
  });
}

import { create } from 'zustand';

import { secureStore } from '@/lib/secureStore';

export type Role = 'tenant' | 'maintainer' | 'landlord' | 'super_admin';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  language: 'es' | 'en';
  notificationPrefs?: {
    pushEnabled: boolean;
    urgentOnly: boolean;
    emailEnabled: boolean;
  };
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticating: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  isAuthenticating: false,

  async hydrate() {
    const token = await secureStore.getToken();
    set({ token, isHydrated: true });
  },

  async setSession(token, user) {
    await secureStore.setToken(token);
    set({ token, user });
  },

  setUser(user) {
    set({ user });
  },

  async signOut() {
    await secureStore.clearToken();
    set({ token: null, user: null });
  },
}));

export const selectToken = (s: AuthState): string | null => s.token;
export const selectUser = (s: AuthState): AuthUser | null => s.user;
export const selectRole = (s: AuthState): Role | null => s.user?.role ?? null;

import type { AuthResponse, User } from '@claro-de-luna/shared';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const ACCESS_KEY = 'cdl_access_token';
const REFRESH_KEY = 'cdl_refresh_token';
const USER_KEY = 'cdl_user';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrate: () => Promise<void>;
  setSession: (session: AuthResponse) => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  refreshToken: null,

  hydrate: async () => {
    const [accessToken, refreshToken, rawUser] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);

    if (accessToken && refreshToken && rawUser) {
      set({
        status: 'authenticated',
        accessToken,
        refreshToken,
        user: JSON.parse(rawUser) as User,
      });
    } else {
      set({ status: 'unauthenticated' });
    }
  },

  setSession: async (session) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, session.accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
    set({
      status: 'authenticated',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  },

  updateTokens: async (accessToken, refreshToken) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    ]);
    set({ accessToken, refreshToken });
  },

  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    set({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
  },
}));

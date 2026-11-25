import { create } from 'zustand';

import { apiClient } from '@/lib/api';
import { errorReporter } from '@/lib/error-reporting';
import { readJson, writeJson } from '@/lib/kv-storage';
import { queryClient } from '@/lib/query-client';

import { login } from './api/auth-api';
import { clearUserData } from './clear-user-data';
import { userSchema, type Credentials, type User } from './types';

const USER_KEY = 'session.user';

export type SessionStatus = 'restoring' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: User | null;
  expired: boolean;
  restore: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  expire: () => void;
  acknowledgeExpiry: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'restoring',
  user: null,
  expired: false,

  restore: async () => {
    try {
      const tokens = await apiClient.getTokens();
      const user = readJson(USER_KEY, userSchema);
      if (tokens && user) {
        set({ status: 'signedIn', user });
        return;
      }
      if (tokens) await apiClient.clearTokens();
    } catch (error) {
      errorReporter.captureException(error, { area: 'session-restore' });
    }
    set({ status: 'signedOut', user: null });
  },

  signIn: async (credentials) => {
    const { user, tokens } = await login(credentials);
    const previousUser = readJson(USER_KEY, userSchema);
    if (previousUser && previousUser.id !== user.id) {
      await clearUserData();
    }
    await apiClient.setTokens(tokens);
    writeJson(USER_KEY, user);
    set({ status: 'signedIn', user, expired: false });
  },

  signOut: async () => {
    await clearUserData();
    set({ status: 'signedOut', user: null, expired: false });
  },

  expire: () => {
    queryClient.clear();
    set({ status: 'signedOut', user: null, expired: true });
  },

  acknowledgeExpiry: () => set({ expired: false }),
}));

apiClient.setSessionExpiredHandler(() => useSessionStore.getState().expire());

useSessionStore.subscribe((state, previous) => {
  if (state.user?.id === previous.user?.id) return;
  errorReporter.setUser(state.user ? { id: state.user.id } : null);
});

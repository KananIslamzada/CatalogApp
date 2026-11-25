import * as SecureStore from 'expo-secure-store';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const tokenStorage = {
  async read(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY, options),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY, options),
    ]);

    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async save({ accessToken, refreshToken }: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, options),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, options),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, options),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options),
    ]);
  },
};

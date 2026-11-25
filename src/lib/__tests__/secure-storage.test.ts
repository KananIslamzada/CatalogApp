import * as SecureStore from 'expo-secure-store';

import { tokenStorage } from '../secure-storage';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 0,
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };

describe('tokenStorage', () => {
  afterEach(async () => {
    await tokenStorage.clear();
  });

  it('returns null when nothing is stored', async () => {
    await expect(tokenStorage.read()).resolves.toBeNull();
  });

  it('reads back saved tokens', async () => {
    await tokenStorage.save(tokens);

    await expect(tokenStorage.read()).resolves.toEqual(tokens);
  });

  it('returns null when only one of the tokens is present', async () => {
    await tokenStorage.save(tokens);
    await SecureStore.deleteItemAsync('auth.refreshToken');

    await expect(tokenStorage.read()).resolves.toBeNull();
  });

  it('removes both tokens on clear', async () => {
    await tokenStorage.save(tokens);
    await tokenStorage.clear();

    await expect(tokenStorage.read()).resolves.toBeNull();
  });
});

import { apiClient } from '@/lib/api';
import { clearKvStorage, writeJson } from '@/lib/kv-storage';

import { login } from '../api/auth-api';
import { clearUserData } from '../clear-user-data';
import { useSessionStore } from '../session-store';
import { type User } from '../types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api/api-error'),
  apiClient: {
    getTokens: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    setSessionExpiredHandler: jest.fn(),
  },
}));
jest.mock('../api/auth-api', () => ({ login: jest.fn() }));
jest.mock('../clear-user-data', () => ({ clearUserData: jest.fn() }));

const mockedApi = jest.mocked(apiClient);
const mockedLogin = jest.mocked(login);
const mockedClearUserData = jest.mocked(clearUserData);
const sessionExpiredHandler = mockedApi.setSessionExpiredHandler.mock.calls[0]?.[0];

const emily: User = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://example.com/emily.png',
};
const tokens = { accessToken: 'access', refreshToken: 'refresh' };

describe('session store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearKvStorage();
    useSessionStore.setState({ status: 'restoring', user: null, expired: false });
  });

  describe('restore', () => {
    it('signs in from stored tokens and the cached profile', async () => {
      mockedApi.getTokens.mockResolvedValue(tokens);
      writeJson('session.user', emily);

      await useSessionStore.getState().restore();

      expect(useSessionStore.getState()).toMatchObject({ status: 'signedIn', user: emily });
    });

    it('signs out when there are no tokens', async () => {
      mockedApi.getTokens.mockResolvedValue(null);
      writeJson('session.user', emily);

      await useSessionStore.getState().restore();

      expect(useSessionStore.getState()).toMatchObject({ status: 'signedOut', user: null });
    });

    it('drops orphaned tokens when the profile is missing', async () => {
      mockedApi.getTokens.mockResolvedValue(tokens);

      await useSessionStore.getState().restore();

      expect(useSessionStore.getState().status).toBe('signedOut');
      expect(mockedApi.clearTokens).toHaveBeenCalled();
    });

    it('signs out when secure storage fails', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      mockedApi.getTokens.mockRejectedValue(new Error('keychain unavailable'));

      await useSessionStore.getState().restore();

      expect(useSessionStore.getState().status).toBe('signedOut');
    });
  });

  describe('signIn', () => {
    it('stores the session and signs in', async () => {
      mockedLogin.mockResolvedValue({ user: emily, tokens });

      await useSessionStore.getState().signIn({ username: 'emilys', password: 'emilyspass' });

      expect(mockedApi.setTokens).toHaveBeenCalledWith(tokens);
      expect(useSessionStore.getState()).toMatchObject({ status: 'signedIn', user: emily });
      expect(mockedClearUserData).not.toHaveBeenCalled();
    });

    it("wipes the previous user's data when a different user signs in", async () => {
      writeJson('session.user', { ...emily, id: 2, username: 'michaelw' });
      mockedLogin.mockResolvedValue({ user: emily, tokens });

      await useSessionStore.getState().signIn({ username: 'emilys', password: 'emilyspass' });

      expect(mockedClearUserData).toHaveBeenCalledTimes(1);
    });

    it('stays signed out and rethrows when login fails', async () => {
      useSessionStore.setState({ status: 'signedOut' });
      mockedLogin.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useSessionStore.getState().signIn({ username: 'emilys', password: 'nope' }),
      ).rejects.toThrow('Invalid credentials');

      expect(useSessionStore.getState().status).toBe('signedOut');
      expect(mockedApi.setTokens).not.toHaveBeenCalled();
    });
  });

  it('clears every piece of user data on sign out', async () => {
    useSessionStore.setState({ status: 'signedIn', user: emily });

    await useSessionStore.getState().signOut();

    expect(mockedClearUserData).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState()).toMatchObject({ status: 'signedOut', user: null });
  });

  it('returns to sign in with a notice when the API reports an expired session', () => {
    useSessionStore.setState({ status: 'signedIn', user: emily });

    sessionExpiredHandler?.();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      user: null,
      expired: true,
    });
  });
});

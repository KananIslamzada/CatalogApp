import { NetworkStateType } from 'expo-network';

import { isOffline } from '../network';

describe('isOffline', () => {
  it('is offline without a connection or without internet', () => {
    expect(isOffline({ type: NetworkStateType.NONE, isConnected: false })).toBe(true);
    expect(
      isOffline({ type: NetworkStateType.WIFI, isConnected: true, isInternetReachable: false }),
    ).toBe(true);
  });

  it('is online when connected, or while the state is still unknown', () => {
    expect(
      isOffline({ type: NetworkStateType.WIFI, isConnected: true, isInternetReachable: true }),
    ).toBe(false);
    expect(isOffline({})).toBe(false);
  });
});

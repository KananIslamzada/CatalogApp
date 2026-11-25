import { onlineManager } from '@tanstack/react-query';
import { addNetworkStateListener, useNetworkState, type NetworkState } from 'expo-network';

export function isOffline(state: NetworkState): boolean {
  return state.isConnected === false || state.isInternetReachable === false;
}

export function useIsOffline(): boolean {
  return isOffline(useNetworkState());
}

export function connectOnlineManager(): void {
  onlineManager.setEventListener((setOnline) => {
    const subscription = addNetworkStateListener((state) => setOnline(!isOffline(state)));
    return () => subscription.remove();
  });
}

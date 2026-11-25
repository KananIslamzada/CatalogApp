import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useSessionStore } from '../session-store';

export function useSessionBootstrap() {
  const status = useSessionStore((state) => state.status);
  const restore = useSessionStore((state) => state.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (status !== 'restoring') SplashScreen.hideAsync();
  }, [status]);

  return status;
}

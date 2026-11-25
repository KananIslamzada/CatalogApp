import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { easeOut } from '@/theme';

const STALE_OPACITY = 0.5;
const FADE = { duration: 180, easing: easeOut };

export function useStaleFade(isStale: boolean) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.set(withTiming(isStale ? STALE_OPACITY : 1, FADE));
  }, [isStale, opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}

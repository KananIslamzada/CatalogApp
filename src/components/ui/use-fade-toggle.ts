import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { easeOut } from '@/theme';

const TOGGLE = { duration: 150, easing: easeOut };
const HIDDEN_SCALE = 0.6;

export function useFadeToggle(visible: boolean) {
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(visible ? 1 : 0, TOGGLE));
  }, [progress, visible]);

  return useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: HIDDEN_SCALE + (1 - HIDDEN_SCALE) * progress.get() }],
  }));
}

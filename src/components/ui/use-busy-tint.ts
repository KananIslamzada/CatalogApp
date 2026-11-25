import { useEffect } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { easeOut } from '@/theme';

const BUSY_TIMING = { duration: 180, easing: easeOut };
const BUSY_LABEL_OPACITY = 0.8;

export function useBusyTint(busy: boolean, idleColor: string, busyColor: string) {
  const progress = useSharedValue(busy ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(busy ? 1 : 0, BUSY_TIMING));
  }, [busy, progress]);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [idleColor, busyColor]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.get() * (1 - BUSY_LABEL_OPACITY),
  }));

  return { backgroundStyle, labelStyle };
}

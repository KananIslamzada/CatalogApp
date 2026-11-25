import { useCallback, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { easeOut } from '@/theme';

import { type DialogOptions } from './dialog-store';

const ENTER = { duration: 220, easing: easeOut };
const EXIT = { duration: 160, easing: easeOut };

export function useDialogAnimation(dialog: DialogOptions | null, onHidden: () => void) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!dialog) return;
    progress.set(0);
    progress.set(withTiming(1, ENTER));
  }, [dialog, progress]);

  const hide = useCallback(() => {
    progress.set(
      withTiming(0, EXIT, (finished) => {
        if (finished) scheduleOnRN(onHidden);
      }),
    );
  }, [onHidden, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.96 + progress.get() * 0.04 }, { translateY: (1 - progress.get()) * 8 }],
  }));

  return { hide, backdropStyle, cardStyle };
}

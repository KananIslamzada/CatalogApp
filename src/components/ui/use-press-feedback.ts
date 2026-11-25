import { useCallback, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { easeOut } from '@/theme';

const PRESS_IN = { duration: 90, easing: easeOut };
const PRESS_OUT = { duration: 160, easing: easeOut };
const DIMMED_OPACITY = 0.5;

type PressFeedbackOptions = {
  pressedScale?: number;
  disabled?: boolean;
  dimmed?: boolean;
};

export function usePressFeedback({
  pressedScale = 0.97,
  disabled = false,
  dimmed = disabled,
}: PressFeedbackOptions = {}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(dimmed ? DIMMED_OPACITY : 1);

  useEffect(() => {
    if (disabled) scale.set(withTiming(1, PRESS_OUT));
  }, [disabled, scale]);

  useEffect(() => {
    opacity.set(withTiming(dimmed ? DIMMED_OPACITY : 1, PRESS_OUT));
  }, [dimmed, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ scale: scale.get() }],
  }));

  const onPressIn = useCallback(() => {
    scale.set(withTiming(pressedScale, PRESS_IN));
  }, [pressedScale, scale]);

  const onPressOut = useCallback(() => {
    scale.set(withTiming(1, PRESS_OUT));
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}

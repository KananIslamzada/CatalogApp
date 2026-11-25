import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { easeOut } from '@/theme';

const PRESS_SCALE = 0.996;
const SCALES_ON_PRESS = Platform.OS === 'ios';
const PRESS_OPACITY = 0.8;
const SCALE_SPRING = { damping: 15, stiffness: 400 };
const OPACITY_IN = { duration: 80 };
const OPACITY_OUT = { duration: 150 };
const DIM_TIMING = { duration: 160, easing: easeOut };
const DIMMED_OPACITY = 0.5;

type PressFeedbackOptions = {
  pressedScale?: number;
  disabled?: boolean;
  dimmed?: boolean;
};

export function usePressFeedback({
  pressedScale = PRESS_SCALE,
  disabled = false,
  dimmed = disabled,
}: PressFeedbackOptions = {}) {
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);
  const dimOpacity = useSharedValue(dimmed ? DIMMED_OPACITY : 1);

  useEffect(() => {
    if (!disabled) return;
    scale.set(withSpring(1, SCALE_SPRING));
    pressOpacity.set(withTiming(1, OPACITY_OUT));
  }, [disabled, pressOpacity, scale]);

  useEffect(() => {
    dimOpacity.set(withTiming(dimmed ? DIMMED_OPACITY : 1, DIM_TIMING));
  }, [dimmed, dimOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pressOpacity.get() * dimOpacity.get(),
    transform: [{ scale: scale.get() }],
  }));

  const onPressIn = useCallback(() => {
    if (SCALES_ON_PRESS) scale.set(withSpring(pressedScale, SCALE_SPRING));
    pressOpacity.set(withTiming(PRESS_OPACITY, OPACITY_IN));
  }, [pressOpacity, pressedScale, scale]);

  const onPressOut = useCallback(() => {
    scale.set(withSpring(1, SCALE_SPRING));
    pressOpacity.set(withTiming(1, OPACITY_OUT));
  }, [pressOpacity, scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
